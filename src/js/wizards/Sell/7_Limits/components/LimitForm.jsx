import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Col, Row, Label} from 'reactstrap';
import Input from 'react-validation/build/input';
import {withNamespaces} from 'react-i18next';
import Form from 'react-validation/build/form';
import 'rc-slider/assets/index.css';
import classnames from 'classnames';
import CheckButton from '../../../../ui/CheckButton';

class LimitForm extends Component {
  setCustomLimits = (useCustomLimits) => {    
    this.props.customLimitsChange(useCustomLimits);
    if(!useCustomLimits){
      this.props.limitChange('', '');
    }
  } 

  onLimitChange = (value, limit) => {
    let limitL = this.props.limitL;
    let limitU = this.props.limitU;

    if(limit === 'upper'){
      limitU = value;
    } else {
      limitL = value;
    }

    this.props.limitChange(limitL, limitU);
  };

  render() {
    const {t, limitL, limitU, currency} = this.props;
    return (
      <Form ref={c => {
        this.form = c;
      }}>
        <h2>Do you want to set any limits?</h2>
        <FormGroup className="mb-0">
          <Row>
            <Col>
              <CheckButton align="left" active={this.props.useCustomLimits} onClick={() => { this.setCustomLimits(true); }}>
              Set limits
              </CheckButton>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup className={classnames({"disabled-limits": !this.props.useCustomLimits})}>
          <Row>
            <Col xs={2} sm={1} className="v-align-center">
              <Label for="limitL-input">Min:</Label>
            </Col>
            <Col xs={10} sm={11}>
              <Input type="text" name="limitL" className="form-control" id="limitL-input"
                     value={limitL}
                     disabled={!this.props.useCustomLimits}
                     onChange={(e) => this.onLimitChange(e.target.value, 'lower')}
                     placeholder="0" step="any"/>
              <span className="input-icon mr-3">{currency}</span>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup className={classnames({"disabled-limits": !this.props.useCustomLimits})}>
          <Row>
            <Col xs={2} sm={1} className="v-align-center">
              <Label for="limitU-input" className="align-baseline">Max:</Label>
            </Col>
            <Col xs={10} sm={11}>
              <Input type="text" name="limitU" className="form-control"
                      value={limitU}
                      id="limitU-input"
                      disabled={!this.props.useCustomLimits}
                      onChange={(e) => this.onLimitChange(e.target.value, 'upper')}
                      placeholder="0" step="any"/>
              <span className="input-icon mr-3">{currency}</span>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup>
          <Row className="mt-3">
            <Col>
              <CheckButton align="left" active={!this.props.useCustomLimits} onClick={() => { this.setCustomLimits(false); }}>
              No limits
              </CheckButton>
            </Col>
          </Row>
        </FormGroup>
      </Form>
    );
  }
}

LimitForm.propTypes = {
  t: PropTypes.func,
  limitL: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  limitU: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  useCustomLimits: PropTypes.bool,
  limitChange: PropTypes.func,
  customLimitsChange: PropTypes.func,
  currency: PropTypes.string
};

export default withNamespaces()(LimitForm);
