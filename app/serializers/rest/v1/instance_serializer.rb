# frozen_string_literal: true

class REST::V1::InstanceSerializer < ActiveModel::Serializer
  include RoutingHelper
  include KmyblueCapabilitiesHelper
  include RegistrationLimitationHelper

  attributes :uri, :title, :short_description, :description, :email,
             :version, :urls, :stats, :thumbnail,
             :languages, :registrations, :approval_required, :invites_enabled,
             :configuration, :fedibird_capabilities

  has_one :contact_account, serializer: REST::AccountSerializer

  has_many :rules, serializer: REST::RuleSerializer

  def uri
    object.domain
  end

  def short_description
    object.description
  end

  def description
    Setting.site_description # Legacy
  end

  def email
    object.contact.email
  end

  def contact_account
    object.contact.account
  end

  def thumbnail
    instance_presenter.thumbnail ? full_asset_url(instance_presenter.thumbnail.file.url(:'@1x')) : frontend_asset_url('images/preview.png')
  end

  def stats
    {
      user_count: instance_presenter.user_count,
      status_count: instance_presenter.status_count,
      domain_count: instance_presenter.domain_count,
    }
  end

  def urls
    { streaming_api: Rails.configuration.x.streaming_api_base_url }
  end

  def usage
    {
      users: {
        active_month: instance_presenter.active_user_count(4),
      },
    }
  end

  def configuration
    {
      accounts: {
        max_featured_tags: FeaturedTag::LIMIT,
      },

      statuses: {
        max_characters: StatusLengthValidator::MAX_CHARS,
        max_media_attachments: Status::MEDIA_ATTACHMENTS_LIMIT,
        max_media_attachments_with_poll: Status::MEDIA_ATTACHMENTS_LIMIT_WITH_POLL,
        max_media_attachments_from_activitypub: Status::MEDIA_ATTACHMENTS_LIMIT_FROM_REMOTE,
        characters_reserved_per_url: StatusLengthValidator::URL_PLACEHOLDER_CHARS,
      },

      media_attachments: {
        supported_mime_types: MediaAttachment.supported_mime_types,
        image_size_limit: MediaAttachment::IMAGE_LIMIT,
        image_matrix_limit: Attachmentable::MAX_MATRIX_LIMIT,
        video_size_limit: MediaAttachment::VIDEO_LIMIT,
        video_frame_rate_limit: MediaAttachment::MAX_VIDEO_FRAME_RATE,
        video_matrix_limit: MediaAttachment::MAX_VIDEO_MATRIX_LIMIT,
      },

      polls: {
        max_options: PollValidator::MAX_OPTIONS,
        max_characters_per_option: PollValidator::MAX_OPTION_CHARS,
        min_expiration: PollValidator::MIN_EXPIRATION,
        max_expiration: PollValidator::MAX_EXPIRATION,
        allow_image: true,
      },

      emoji_reactions: {
        max_reactions: EmojiReaction::EMOJI_REACTION_LIMIT,
        max_reactions_per_account: EmojiReaction::EMOJI_REACTION_PER_ACCOUNT_LIMIT,
        max_reactions_per_remote_account: EmojiReaction::EMOJI_REACTION_PER_REMOTE_ACCOUNT_LIMIT,
      },

      reaction_deck: {
        max_emojis: User::REACTION_DECK_MAX,
      },

      reactions: {
        max_reactions: EmojiReaction::EMOJI_REACTION_PER_ACCOUNT_LIMIT,
      },

      # https://github.com/mastodon/mastodon/pull/27009
      search: {
        enabled: Chewy.enabled?,
      },
    }
  end

  def registrations
    Setting.registrations_mode != 'none' && !reach_registrations_limit? && !Rails.configuration.x.single_user_mode
  end

  def approval_required
    Setting.registrations_mode == 'approved' || (Setting.registrations_mode == 'open' && !registrations_in_time?)
  end

  def invites_enabled
    UserRole.everyone.can?(:invite_users)
  end

  private

  def instance_presenter
    @instance_presenter ||= InstancePresenter.new
  end
end
