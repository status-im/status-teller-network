import React, {Component} from 'react';
import Textarea from 'react-validation/build/textarea';
import Form from 'react-validation/build/form';
import {Button} from 'reactstrap';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import arbitration from '../../features/arbitration';
import successImage from '../../../images/success.png';

class OpenDispute extends Component {
  state = {
    value: '',
    displayDialog: false
  }

  constructor(props){
    super(props);
    props.loadArbitration(props.escrowId);
  }

  componentDidUpdate() {
    if (this.props.escrow.arbitration) {
      if(this.props.escrow.arbitration.open || this.props.escrow.arbitration.result !== "0"){
        this.props.history.push('/');
      }
    }
  }

  handleChange = (e) => {
    this.setState({value: e.target.value});
  }

  displayDialog = show => () => {
    this.setState({displayDialog: show});
  };

  goToProfile = () => {
    this.props.history.push('/profile');
  }


  render(){
    const {escrow, openDispute, loading, receipt} = this.props;

    if(!escrow) return <Loading page={true} />;
    if(loading) return <Loading mining={true} />;

    if(receipt) return (
      <div className="text-center p-5">
        <img src={successImage} alt="Success" width="160" height="160" className="mt-5" />
        <h2 className="mt-5">Your dispute was successfully open</h2>
        <p className="text-muted">Follow the progress of your dispute in the profile.</p>
        <p>
          <Button color="primary" onClick={this.goToProfile}>Okay</Button>
        </p>
    </div>
    );

    const onClickDialog = () => {
      openDispute(escrow.escrowId);
    };

    return (
      <div className="openDispute">
        <h2>Open dispute</h2>
        <p>Describe details of your trade</p>
        <Form>
          <Textarea 
            type="text"
            name="disputeDetails"
            id="disputeDetails"
            rows="7"
            placeholder="What has happened?"
            className="form-control mb-2"
            value={this.state.value}
            onChange={this.handleChange}
            validations={[]}
          />
          <p className="text-muted">The process of resolving your dispute could take up on 5 days. You will be sharing you chat logs with an arbiter.</p>
          <p className="text-center">
            <Button color="primary" disabled={!this.state.value} onClick={this.displayDialog(true)}>Send</Button>
          </p>
        </Form>
        <ConfirmDialog display={this.state.displayDialog} onConfirm={onClickDialog} onCancel={this.displayDialog(false)} title="Open dispute" content="Are you sure?" />
      </div>
    );
  }
}

OpenDispute.propTypes = {
  history: PropTypes.object,
  escrow: PropTypes.object,
  escrowId: PropTypes.string,
  loadArbitration: PropTypes.func,
  openDispute: PropTypes.func,
  loading: PropTypes.bool,
  receipt: PropTypes.object
};


const mapStateToProps = (state, props) => {
  return {
    escrowId:  props.match.params.id.toString(),
    escrow: arbitration.selectors.getArbitration(state),
    loading: arbitration.selectors.loading(state),
    receipt: arbitration.selectors.receipt(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadArbitration: arbitration.actions.loadArbitration,
    openDispute: arbitration.actions.openDispute
  }
)(withRouter(OpenDispute));

