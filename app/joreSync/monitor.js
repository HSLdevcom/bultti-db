import {
  SLACK_WEBHOOK_URL,
  ENVIRONMENT,
  SLACK_MONITOR_MENTION,
  MONITORING_ENABLED,
} from '../../constants';
import got from 'got';

export const messageTypes = {
  ERROR: 'error',
  INFO: 'info',
};

export async function reportError(err = null) {
  const message =
    typeof err === 'string' ? err : typeof err.message === 'string' ? err.message : '';

  return onMonitorEvent(message, messageTypes.ERROR).then(() => err);
}

export async function reportInfo(message = '') {
  return onMonitorEvent(message, messageTypes.INFO);
}

export async function onMonitorEvent(
  message = 'Something happened.',
  type = messageTypes.ERROR
) {
  if (!message || !MONITORING_ENABLED) {
    return false;
  }

  const mentionUser = type === messageTypes.ERROR ? SLACK_MONITOR_MENTION : '';

  const fullMessage = `${
    mentionUser ? `Hey <@${mentionUser}>, ` : ''
  }${type} message from Bultti DB sync [${ENVIRONMENT.toUpperCase()}]:\n
\`\`\`${message}\`\`\``;

  const body = {
    type: 'mrkdwn',
    text: fullMessage,
  };

  return got(SLACK_WEBHOOK_URL, {
    method: 'post',
    json: body,
  });
}
