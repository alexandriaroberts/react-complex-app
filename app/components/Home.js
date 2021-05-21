import React, { useEffect, useContext } from "react";
import Page from "./Page";
import StateContext from "../StateContext";
import { useImmer } from "use-immer";
import LoadingDotsIcon from "./LoadingDotsIcon";
import Axios from "axios";
import { Link } from "react-router-dom";
import Post from "./Post";

function Home() {
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({ isLoading: true, feed: [] });

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    async function fetchData() {
      try {
        // first is the URL you want to send request to
        // s econd is any data you want to send it to the server
        const response = await Axios.post(
          "/getHomeFeed",
          {
            token: appState.user.token,
          },
          { cancelToken: ourRequest.token }
        );
        setState((draft) => {
          draft.isLoading = false;
          draft.feed = response.data;
        });
        return () => {
          ourRequest.cancel();
        };
      } catch (error) {
        console.log("There was a problem");
      }
    }
    fetchData();
  }, []);

  if (state.isLoading) {
    return <LoadingDotsIcon />;
  }

  return (
    <Page title="Your feed">
      {state.feed.length > 0 && (
        <>
          <h2 className="text-center mb-4">Latest of those you follow</h2>
          <div className="list-group">
            {state.feed.map((post) => {
              return <Post post={post} key={post._id} />;
            })}
          </div>
        </>
      )}
      {state.feed.length == 0 && (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.useename}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">
            Your feed displays the latest posts from the people you follow. If
            you don&rsquo;t have any friends to follow that&rsquo;s okay; you
            can use the &ldquo;Search&rdquo; feature in the top menu bar to find
            content written by people with similar interests and then follow
            them.
          </p>
        </>
      )}
    </Page>
  );
}

export default Home;
