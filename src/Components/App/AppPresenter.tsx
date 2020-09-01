import React from "react";
import PropTypes from "prop-types";

interface IProps {
  isLoggedIn: boolean;
}

const AppPresenter: React.FC<IProps> = ({ isLoggedIn }) =>
  isLoggedIn ? <span>You are in</span> : <span>You are out</span>;

AppPresenter.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default AppPresenter;
