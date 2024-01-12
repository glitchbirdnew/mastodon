import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl } from 'react-intl';

import classNames from 'classnames';

import { connect } from 'react-redux';

import { ReactComponent as CancelIcon } from '@material-symbols/svg-600/outlined/cancel-fill.svg';
import { ReactComponent as SearchIcon } from '@material-symbols/svg-600/outlined/search.svg';

import { Icon }  from 'mastodon/components/icon';

import { fetchAntennaSuggestions, clearAntennaSuggestions, changeAntennaSuggestions } from '../../../actions/antennas';

const messages = defineMessages({
  search: { id: 'antennas.search', defaultMessage: 'Search among people you follow' },
});

const mapStateToProps = state => ({
  value: state.getIn(['antennaEditor', 'suggestions', 'value']),
});

const mapDispatchToProps = dispatch => ({
  onSubmit: value => dispatch(fetchAntennaSuggestions(value)),
  onClear: () => dispatch(clearAntennaSuggestions()),
  onChange: value => dispatch(changeAntennaSuggestions(value)),
});

class Search extends PureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
  };

  handleChange = e => {
    this.props.onChange(e.target.value);
  };

  handleKeyUp = e => {
    if (e.keyCode === 13) {
      this.props.onSubmit(this.props.value);
    }
  };

  handleClear = () => {
    this.props.onClear();
  };

  render () {
    const { value, intl } = this.props;
    const hasValue = value.length > 0;

    return (
      <div className='list-editor__search search'>
        <label>
          <span style={{ display: 'none' }}>{intl.formatMessage(messages.search)}</span>

          <input
            className='search__input'
            type='text'
            value={value}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyUp}
            placeholder={intl.formatMessage(messages.search)}
          />
        </label>

        <div role='button' tabIndex={0} className='search__icon' onClick={this.handleClear}>
          <Icon id='search' icon={SearchIcon} className={classNames({ active: !hasValue })} />
          <Icon id='times-circle' icon={CancelIcon} aria-label={intl.formatMessage(messages.search)} className={classNames({ active: hasValue })} />
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Search));