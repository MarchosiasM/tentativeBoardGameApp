import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
// import Helmet from 'react-helmet';
import OwnerGuest from '../../components/EventPageDetails/OwnerGuest';
/* eslint-disable react/prop-types */
// Import Style
import styles from '../../components/EventListItem/EventListItem.css';

// Import Actions
import { fetchEvent, passAttendee } from '../../EventActions';

// Import Selectors
import { getEvent } from '../../EventReducer';

/* This is the base level component for the event details page for users.
  At this level we hand down all the necessary moving parts for differentiation
  but first we ensure the event exists. The event may not exist because of
  deletion. */

class EventDetailPage extends Component {
  constructor() {
    super();
    this.state = {
      owner: false,
      member: false,
    };
  }

  componentDidMount = () => {
    this.setState({ owner: this.ifUserOwns() });
    if (!this.ifUserOwns()) {
      // console.log('Running member check');
      this.runMemberCheck();
    }
  }

  runMemberCheck = () => {
    // console.log('Attendees length, ', this.props.attendees);
    for (let i = 0; i < this.props.attendees; i += 1) {
      // console.log('Current user ID, ', this.props.user);
      // console.log('Attendees ID, ', this.props.event.attendees[i]);
      if (this.props.user === this.props.event.attendees[i]) {
        this.setState({ member: true });
        return true;
      }
    }
    // console.log('Ending member check with false');
    return false;
  }

  isFull = () => {
    // console.log('Your slots, ', this.props.event.slots);
    // console.log('Your attendees, ', this.props.attendees);
    // console.log('This dude a member already?', this.state.member);
    if (this.props.event.slots - this.props.attendees <= 0) {
      return true;
    }
    return false;
  };

  addAttendee = () => {
    this.setState({ member: true });
    return this.props.dispatch(passAttendee(this.props.event.cuid, this.props.user));
  };

  ifUserOwns = () => {
    return (this.props.event.owner === this.props.user);
  };


  render() {
    return (
      <div>
        {this.props.event
          ?
          <OwnerGuest
            owner={this.state.owner}
            event={this.props.event}
            styles={styles}
            dispatch={this.props.dispatch}
            addAttendee={this.addAttendee}
            isFull={this.isFull()}
            member={this.state.member}
          />
          :
          'This event no longer exists.'
        }
      </div>
    );
  }
}

// Actions required to provide data for this component to render in server side.
EventDetailPage.need = [(params) => {
  return fetchEvent(params.cuid);
}];

// Retrieve data from store as props
function mapStateToProps(state, props) {
  return {
    event: getEvent(state, props.params.cuid),
    user: state.authUser.data[0].uid,
    attendees: getEvent(state, props.params.cuid) ? getEvent(state, props.params.cuid).attendees.length : '',
  };
}

EventDetailPage.propTypes = {
  event: PropTypes.shape({
    eventName: PropTypes.string.isRequired,
    game: PropTypes.string.isRequired,
    gameType: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zipcode: PropTypes.string,
    scheduledDate: PropTypes.string.isRequired,
    scheduledTime: PropTypes.string.isRequired,
    notes: PropTypes.string.isRequired,
    owner: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    cuid: PropTypes.string.isRequired,
    slots: PropTypes.number.isRequired,
  }),
};

export default connect(mapStateToProps)(EventDetailPage);