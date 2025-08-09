import React, { memo } from "react";
import Lottie from "lottie-react";
import animationData from "../../assets/img/loading/loadingCart.json"; // đường dẫn tới file JSON

function LoadingDefault() {
  return (
    <div style={styles.container}>
      <div style={{ width: 120, height: 120 }}>
        <Lottie animationData={animationData} loop={true} />
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100%",
    height: "100%",
    minHeight: 100,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 8,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 500,
  },
};

export default memo(LoadingDefault);
