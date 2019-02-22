import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Input, Form} from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";

const SearchBar = (props) => (<Form className={"search-bar " + props.className}>
  <FormGroup>
    <Input type="text" name="search" placeholder={props.placeholder} onKeyPress={e => e.key === 'Enter' && e.preventDefault()}
           onChange={(e) => props.onChange && props.onChange(e.target.value)}/>
    <FontAwesomeIcon className="search-icon input-icon" icon={faSearch} size="lg"/>
  </FormGroup>
</Form>);

SearchBar.propTypes = {
  className: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func
};

export default SearchBar;
