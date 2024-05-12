"use client"; 

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import emailjs from '@emailjs/browser';

function ContactForm (){
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => emailjs.init("d7Kkjhbe6p_mr3WuQ"), []);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const serviceId = "service_48n817v";
    const templateId = "template_ym0tqpq";
    try {
      setLoading(true);
      await emailjs.send(serviceId, templateId, {
        name: nameRef.current?.value,
        sender: emailRef.current?.value,
        subject: subjectRef.current?.value,
        message: messageRef.current?.value
      });
      alert("Email was send. Thank you!");
      if (nameRef.current) nameRef.current.value = '';
      if (emailRef.current) emailRef.current.value = '';
      if (subjectRef.current) subjectRef.current.value = '';
      if (messageRef.current) messageRef.current.value = '';
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact1">
      <form className="contact1-form validate-form" onSubmit={handleSubmit}>
        <span className="contact1-form-title">
            Contact me!
        </span>

        <div className="wrap-input1 validate-input" data-validate = "Name is required">
          <input required ref={nameRef} className="input1" type="text" name="name" placeholder="Name" />
          <span className="shadow-input1"></span>
        </div>

        <div className="wrap-input1 validate-input" data-validate = "Valid email is required: ex@abc.xyz">
          <input required ref={emailRef} className="input1" type="text" name="email" placeholder="Email"/>
          <span className="shadow-input1"></span>
        </div>

        <div className="wrap-input1 validate-input" data-validate = "Subject is required">
          <input required ref={subjectRef} className="input1" type="text" name="subject" placeholder="Subject" />
          <span className="shadow-input1"></span>
        </div>

        <div className="wrap-input1 validate-input" data-validate = "Message is required">
          <textarea required ref={messageRef} className="input1" name="message" placeholder="Message"></textarea>
          <span className="shadow-input1"></span>
        </div>

        <div className="container-contact1-form-btn">
          <button type='submit' className="contact1-form-btn" disabled={loading}>
            <span>
              Send
              <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;