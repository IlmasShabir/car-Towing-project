import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import './PageHeader.css';

const PageHeader = ({ title, crumb }) => (
  <header className="page-header">
    <Reveal>
      <h1>{title}</h1>
      <p className="breadcrumb">
        <Link to="/">Home</Link> / {crumb || title}
      </p>
    </Reveal>
  </header>
);

export default PageHeader;
