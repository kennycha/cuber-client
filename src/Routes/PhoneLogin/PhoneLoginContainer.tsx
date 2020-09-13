import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
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
    const isValid = /^\+[1-9]{1}[0-9]{7,11}$/.test(
      `${countryCode}${phoneNumber}`
    );
    if (isValid) {
      return;
    } else {
      toast.error("Please write a valid phone number");
    }
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
