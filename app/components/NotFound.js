import React from "react";
import Page from "./Page";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <Page title="Not Found">
      <div className="center">
        <h2 className="center">We cannot find that page</h2>
        <p className="lead text-muted">
          Go back to <Link to="/">homepage</Link>
        </p>
      </div>
    </Page>
  );
}

export default NotFound;
