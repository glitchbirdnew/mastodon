import api, { apiRequest, getLinks } from 'mastodon/api';
import type {
  ApiNotificationGroupsResultJSON,
  ApiNotificationGroupJSON,
} from 'mastodon/api_types/notifications';
import type { ApiStatusJSON } from 'mastodon/api_types/statuses';

const exceptInvalidNotifications = (
  notifications: ApiNotificationGroupJSON[],
) => {
  return notifications.filter((n) => {
    if ('status' in n) {
      return (n.status as ApiStatusJSON | null) !== null;
    }
    return true;
  });
};

export const apiFetchNotifications = async (params?: {
  exclude_types?: string[];
  max_id?: string;
  since_id?: string;
}) => {
  const response = await api().request<ApiNotificationGroupsResultJSON>({
    method: 'GET',
    url: '/api/v2_alpha/notifications',
    params,
  });

  const { statuses, accounts, notification_groups } = response.data;

  return {
    statuses,
    accounts,
    notifications: exceptInvalidNotifications(notification_groups),
    links: getLinks(response),
  };
};

export const apiClearNotifications = () =>
  apiRequest<undefined>('POST', 'v1/notifications/clear');
