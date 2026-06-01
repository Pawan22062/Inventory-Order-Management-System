function Loading({ label = 'Loading...' }) {
  return (
    <div className="loading" role="status">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export default Loading;
