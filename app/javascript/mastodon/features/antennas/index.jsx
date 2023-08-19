import PropTypes from 'prop-types';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { fetchAntennas } from 'mastodon/actions/antennas';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import { Icon }  from 'mastodon/components/icon';
import { LoadingIndicator } from 'mastodon/components/loading_indicator';
import ScrollableList from 'mastodon/components/scrollable_list';
import ColumnLink from 'mastodon/features/ui/components/column_link';
import ColumnSubheading from 'mastodon/features/ui/components/column_subheading';

import NewAntennaForm from './components/new_antenna_form';

const messages = defineMessages({
  heading: { id: 'column.antennas', defaultMessage: 'Antennas' },
  subheading: { id: 'antennas.subheading', defaultMessage: 'Your antennas' },
});

const getOrderedAntennas = createSelector([state => state.get('antennas')], antennas => {
  if (!antennas) {
    return antennas;
  }

  return antennas.toList().filter(item => !!item).sort((a, b) => a.get('title').localeCompare(b.get('title')));
});

const mapStateToProps = state => ({
  antennas: getOrderedAntennas(state),
});

class Antennas extends ImmutablePureComponent {

  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    antennas: ImmutablePropTypes.list,
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
  };

  UNSAFE_componentWillMount () {
    this.props.dispatch(fetchAntennas());
  }

  render () {
    const { intl, antennas, multiColumn } = this.props;

    if (!antennas) {
      return (
        <Column>
          <LoadingIndicator />
        </Column>
      );
    }

    const emptyMessage = <FormattedMessage id='empty_column.antennas' defaultMessage="You don't have any antennas yet. When you create one, it will show up here." />;

    return (
      <Column bindToDocument={!multiColumn} label={intl.formatMessage(messages.heading)}>
        <ColumnHeader title={intl.formatMessage(messages.heading)} icon='wifi' multiColumn={multiColumn} />

        <NewAntennaForm />

        <ScrollableList
          scrollKey='antennas'
          emptyMessage={emptyMessage}
          prepend={<ColumnSubheading text={intl.formatMessage(messages.subheading)} />}
          bindToDocument={!multiColumn}
        >
          {antennas.map(antenna => (
            <ColumnLink key={antenna.get('id')} to={`/antennasw/${antenna.get('id')}`} icon='wifi' text={antenna.get('title')}>
              <p className='antenna-list-detail'>
                <span className='group'><Icon id='users' />{antenna.get('accounts_count')}</span>
                <span className='group'><Icon id='sitemap' />{antenna.get('domains_count')}</span>
                <span className='group'><Icon id='hashtag' />{antenna.get('tags_count')}</span>
                <span className='group'><Icon id='paragraph' />{antenna.get('keywords_count')}</span>
              </p>
            </ColumnLink>
          ))}
        </ScrollableList>

        <Helmet>
          <title>{intl.formatMessage(messages.heading)}</title>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(Antennas));