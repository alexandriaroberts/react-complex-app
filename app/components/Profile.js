import React, { useEffect, useContext } from "react";
import Page from "./Page";
import { useParams, NavLink, Switch, Route } from "react-router-dom";
import Axios from "axios";
import StateContext from "../StateContext";
import ProfilePosts from "./ProfilePosts";
import { useImmer } from "use-immer";

function Profile() {
  const appState = useContext(StateContext);
  const { username } = useParams();
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar:
        "https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128",
      isFollowing: false,
      counts: {
        postCount: "",
        followerCount: "",
        followingCount: "",
      },
    },
  });

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    async function fetchData() {
      try {
        // first is the URL you want to send request to
        // s econd is any data you want to send it to the server
        const response = await Axios.post(
          `/profile/${username}`,
          {
            token: appState.user.token,
          },
          { cancelToken: ourRequest.token }
        );
        setState((draft) => {
          draft.profileData = response.data;
        });
        return () => {
          ourRequest.cancel();
        };
      } catch (error) {
        console.log("There was a problem");
      }
    }
    fetchData();
  }, [username]);

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });
      const ourRequest = Axios.CancelToken.source();

      async function fetchData() {
        try {
          // first is the URL you want to send request to
          // second is any data you want to send it to the server
          const response = await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            { cancelToken: ourRequest.token }
          );
          setState((draft) => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.followActionLoading = false;
          });
          return () => {
            ourRequest.cancel();
          };
        } catch (error) {
          console.log("There was a problem");
        }
      }
      fetchData();
    }
  }, [state.startFollowingRequestCount]);

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });
      const ourRequest = Axios.CancelToken.source();

      async function fetchData() {
        try {
          // first is the URL you want to send request to
          // second is any data you want to send it to the server
          const response = await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            { cancelToken: ourRequest.token }
          );
          setState((draft) => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followActionLoading = false;
          });
          return () => {
            ourRequest.cancel();
          };
        } catch (error) {
          console.log("There was a problem");
        }
      }
      fetchData();
    }
  }, [state.stopFollowingRequestCount]);

  function startFolowing() {
    setState((draft) => {
      draft.startFollowingRequestCount++;
    });
  }
  function stopFolowing() {
    setState((draft) => {
      draft.stopFollowingRequestCount++;
    });
  }

  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} />{" "}
        {state.profileData.profileUsername}
        {appState.loggedIn &&
          !state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != "..." && (
            <button
              onClick={startFolowing}
              disabled={state.followActionLoading}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}
        {appState.loggedIn &&
          state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != "..." && (
            <button
              onClick={stopFolowing}
              disabled={state.followActionLoading}
              className="btn btn-danger btn-sm ml-2"
            >
              UnFollow <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink
          exact
          to={`/profile/${state.profileData.profileUsername}`}
          className="nav-item nav-link"
        >
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/followers`}
          className="nav-item nav-link"
        >
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/following`}
          className="nav-item nav-link"
        >
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePosts />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfilePosts />
        </Route>
        <Route path="/profile/:username/following">
          <ProfilePosts />
        </Route>
      </Switch>
    </Page>
  );
}

export default Profile;
