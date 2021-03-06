import React, { useContext, useEffect, useState } from "react";
import Page from "./Page";
import Axios from "axios";
import { useParams, Link, withRouter } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import NotFound from "./NotFound";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const { id } = useParams();

  const initialData = {
    title: "",
    author: "",
    createdDate: "",
    avatar: "",
    id: "",
  };

  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState(initialData);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`);
        setPost(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log("An error");
      }
    }
    fetchPost();
  }, [id]);

  if (!isLoading && !post) {
    return <NotFound />;
  }

  if (isLoading) {
    return (
      <Page title="....">
        <LoadingDotsIcon />
      </Page>
    );
  }

  const date = new Date(post.createdDate);
  const dateFormatted = `${
    date.getMonth() + 1
  }/ ${date.getDate()}/${date.getFullYear()}`;

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }

    return false;
  }

  async function deleteHandler() {
    const areYouSure = window.confirm(
      "Do you really want to delete this post?"
    );
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, {
          data: { token: appState.user.token },
        });

        if (response.data == "Success") {
          // Step1 Display a flash message
          appDispatch({
            type: "flashMessage",
            value: "Post was successfully deleted",
          });
          // Step2 Redirect to current user profile
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (e) {
        console.log("There was a problem");
      }
    }
  }
  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link
              to={`/post/${post._id}/edit`}
              data-tip="Edit"
              data-for="edit"
              className="text-primary mr-2"
            >
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />
            <Link
              onClick={deleteHandler}
              className="delete-post-button text-danger"
              data-tip="Delete"
              data-for="delete"
            >
              <i className="fas fa-trash"></i>
            </Link>
            <ReactTooltip id="delete" className="custom-tooltip" />{" "}
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by{" "}
        <Link to={`/profile/${post.author}`}>{post.author.username}</Link>{" "}
        {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} />
      </div>
    </Page>
  );
}

export default withRouter(ViewSinglePost);
