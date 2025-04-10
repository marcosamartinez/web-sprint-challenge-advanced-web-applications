import React, { useState } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import Articles from "./Articles";
import LoginForm from "./LoginForm";
import Message from "./Message";
import ArticleForm from "./ArticleForm";
import Spinner from "./Spinner";
import axios from "axios";

const articlesUrl = "http://localhost:9000/api/articles";
const loginUrl = "http://localhost:9000/api/login";

export default function App() {
  const [message, setMessage] = useState("");
  const [articles, setArticles] = useState([]);
  const [currentArticleId, setCurrentArticleId] = useState();
  const [spinnerOn, setSpinnerOn] = useState(false);

  const navigate = useNavigate();
  const redirectToLogin = () => {
    navigate("/");
  };
  const redirectToArticles = () => {
    navigate("/articles");
  };

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    let token = localStorage.getItem("token");
    if (token) {
      localStorage.clear();
      setMessage("Goodbye!");
    }
    redirectToLogin();
  };

  const login = ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    const loginAction = async () => {
      setMessage("");
      setSpinnerOn(true);
      try {
        await axios
          .post(loginUrl, { username, password })
          .then((response) => {
            setMessage(response.data.message);
            const token = response.data.token;
            localStorage.setItem("token", token);
            redirectToArticles();
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (err) {
        console.log(err);
      } finally {
        setSpinnerOn(false);
      }
    };
    loginAction();
  };

  const getArticles = () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    const articlesAction = async () => {
      setMessage("");
      setSpinnerOn(true);
      try {
        const token = localStorage.getItem("token");
        await axios
          .get(articlesUrl, {
            headers: {
              Authorization: `${token}`,
            },
          })
          .then((response) => {
            console.log(response.data);
            setMessage(response.data.message);
            setArticles(response.data.articles);
          })
          .catch((err) => {
            if (err.response && err.response.status === 401) {
              redirectToLogin();
            }
            console.log(err);
          });
      } catch (err) {
        console.log(err);
      } finally {
        setSpinnerOn(false);
      }
    };
    articlesAction();
  };

  const postArticle = (article) => {
    setSpinnerOn(true);
    const token = localStorage.getItem("token");

    axios
      .post(articlesUrl, article, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        setArticles([...articles, response.data.article]);
        setMessage(response.data.message);
      })
      .catch((error) => {
        error.response && error.response.status === 401
          ? redirectToLogin()
          : setMessage(
              error.response?.data?.message || "Error creating article"
            );
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  };

  const updateArticle = ({ article_id, article }) => {
    if (!article_id) {
      setMessage("Error: No article ID provided for update");
      return;
    }

    setSpinnerOn(true);
    const token = localStorage.getItem("token");

    axios
      .put(`${articlesUrl}/${article_id}`, article, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        setMessage(response.data.message);
        setArticles(
          articles.map((art) =>
            art.article_id === article_id ? response.data.article : art
          )
        );
        setCurrentArticleId(null);
      })
      .catch((error) => {
        console.error("Update error:", error);
        error.response && error.response.status === 401
          ? redirectToLogin()
          : setMessage(
              error.response?.data?.message ||
                `Error updating article: ${article_id}`
            );
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  };

  const deleteArticle = (article_id) => {
    setSpinnerOn(true);
    const token = localStorage.getItem("token");

    axios
      .delete(`${articlesUrl}/${article_id}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        setArticles(
          articles.filter((article) => article.article_id !== article_id)
        );
        setMessage(response.data.message);
      })
      .catch((error) => {
        error.response && error.response.status === 401
          ? redirectToLogin()
          : setMessage(
              error.response?.data?.message || "Error deleting article"
            );
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  };

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>
        Logout from app
      </button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}>
        {" "}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">
            Login
          </NavLink>
          <NavLink id="articlesScreen" to="/articles">
            Articles
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route
            path="articles"
            element={
              <>
                <ArticleForm
                  currentArticle={articles.find(
                    (article) => article.article_id === currentArticleId
                  )}
                  postArticle={postArticle}
                  updateArticle={updateArticle}
                  setCurrentArticleId={setCurrentArticleId}
                />
                <Articles
                  articles={articles}
                  getArticles={getArticles}
                  setCurrentArticleId={setCurrentArticleId}
                  currentArticleId={currentArticleId}
                  deleteArticle={deleteArticle}
                />
              </>
            }
          />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  );
}
