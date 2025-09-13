import React from "react";

export default function Loading() {
  return (
    <>
      <div className="flex justify-center items-center h-screen" dir="ltr">
        <div className="loader">
          <div data-glitch="Loading..." className="glitch">
            Loading...
          </div>
        </div>
      </div>
    </>
  );
}
