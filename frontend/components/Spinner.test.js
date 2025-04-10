// Import the Spinner component into this file and test
import Spinner from "./Spinner";
import { render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
// that it renders what it should for the different props it can take.

const expectedLoadingMessage = "Please wait...";

test("renders nothing if false passed in as props", () => {
  render(<Spinner on={false} />);
  const loadingEle = screen.queryByText(expectedLoadingMessage);
  expect(loadingEle).not.toBeInTheDocument();
});

test("renders loading message if true passed in as props", () => {
  render(<Spinner on={true} />);
  const loadingEle = screen.getByText(expectedLoadingMessage);
  expect(loadingEle).toBeVisible();
});

test("rerenders properly from false to true", () => {
  const { rerender } = render(<Spinner on={false} />);
  const loadingEle = screen.queryByText(expectedLoadingMessage);
  expect(loadingEle).not.toBeInTheDocument();

  rerender(<Spinner on={true} />);
  screen.getByText(expectedLoadingMessage);
});
