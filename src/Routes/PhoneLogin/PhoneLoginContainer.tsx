import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import PhoneLoginPresenter from "./PhoneLoginPresenter";

const PhoneLoginContainer: React.FC<RouteComponentProps<any>> = () => {
  const [countryCode, setCountryCode] = useState<string>("+82");
  const [phoneNumber, setPhoneNumber] = useState<string>("12345");

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const {
      target: { value },
    } = event;
    setPhoneNumber(value);
  };
  const onSelectChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    const {
      target: { value },
    } = event;
    setCountryCode(value);
  };
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    console.log(countryCode, phoneNumber);
  };

  return (
    <PhoneLoginPresenter
      countryCode={countryCode}
      phoneNumber={phoneNumber}
      onInputChange={onInputChange}
      onSelectChange={onSelectChange}
      onSubmit={onSubmit}
    />
  );
};

export default PhoneLoginContainer;
