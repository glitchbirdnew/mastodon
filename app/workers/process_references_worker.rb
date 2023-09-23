# frozen_string_literal: true

class ProcessReferencesWorker
  include Sidekiq::Worker

  def perform(status_id, ids, urls, no_fetch_urls)
    ProcessReferencesService.new.call(Status.find(status_id), ids || [], urls: urls || [], no_fetch_urls: no_fetch_urls)
  rescue ActiveRecord::RecordNotFound
    true
  end
end