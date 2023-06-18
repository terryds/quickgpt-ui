const Loading = () => {
  return (
    <>
      <div
        style={{
          backgroundColor: '#343541',
        }}
        className="flex flex-col w-screen h-screen justify-center items-center"
      >
        <div className="text-2xl font-black mb-3">QuickGPT</div>
        <svg
          id="loading"
          style={{
            display: 'block',
          }}
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
            opacity=".5"
          />
          <path
            fill="currentColor"
            d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"
          >
            <animateTransform
              attributeName="transform"
              dur="1s"
              from="0 12 12"
              repeatCount="indefinite"
              to="360 12 12"
              type="rotate"
            />
          </path>
        </svg>
      </div>
    </>
  );
};

export default Loading;