import React from "react";

const NFTCollection = () => {
  return (
    <div className="container" style={{ marginTop: "150px" }}>
      {/* Profile Section */}
      <div
        className="card-panel light-green lighten-4 z-depth-2"
        style={{ borderRadius: "10px", position: "relative", padding: "20px" }}
      >
        {/* Background Card */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-120px",
            right: "-120px",
            height: "200px",
            backgroundImage: "url('/images/nft-banner.jpg')",
            borderRadius: "10px",
            zIndex: "-1",
          }}
        ></div>

        <div className="row valign-wrapper">
          {/* Profile Image */}
          <div className="col s2 center-align">
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundImage: "url('/images/nft-banner.jpg')",
                marginBottom: "5px",
              }}
            ></div>
          </div>

          {/* Name & Bio */}
          <div className="col s7">
            <h5 style={{ color: "black", fontWeight: "bold" }}>John Doe</h5>
            <p style={{ color: "black" }}>
              Digital artist & NFT collector. Exploring the world of blockchain creativity.
            </p>
          </div>

          {/* Followers Count */}
          <div className="col s3 center-align">
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "black",
                fontSize: "16px",
                border: "2px solid black",
                margin: "auto",
              }}
            >
              26K
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="row" style={{ marginTop: "20px", textAlign: "center" }}>
          <div className="col s4">
            <div
              className="card-panel white black-text"
              style={{ borderRadius: "8px", padding: "10px", fontWeight: "bold" }}
            >
              <p>Floor Price: 0.00 ETH</p>
            </div>
          </div>
          <div className="col s4">
            <div
              className="card-panel white black-text"
              style={{ borderRadius: "8px", padding: "10px", fontWeight: "bold" }}
            >
              <p>Volume</p>
            </div>
          </div>
          <div className="col s4">
            <div
              className="card-panel white black-text"
              style={{ borderRadius: "8px", padding: "10px", fontWeight: "bold" }}
            >
              <p>Items</p>
            </div>
          </div>
        </div>

        {/* Social Media Icons & Follow Button */}
        <div className="row" style={{ textAlign: "left", marginTop: "10px" }}>
          <div className="col s9">
            <a href="#" className="blue-text text-darken-2" style={{ marginRight: "10px", fontSize: "24px" }}>
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="black-text" style={{ marginRight: "10px", fontSize: "24px" }}>
              <i className="fab fa-twitter"></i>

            </a>
            <a href="#" className="pink-text" style={{ fontSize: "24px" }}>
              <i className="fab fa-instagram"></i>
            </a>
          </div>

          {/* Follow Button on the Right */}
          <div className="col s3 right-align">
          <a href="#" className="btn black white-text" style={{ borderRadius: "20px", padding: "5px 15px" }}>
            <i className="fas fa-user-plus" style={{ marginRight: "5px" }}></i> Follow
          </a>

          </div>
        </div>
      </div>


      {/* NFT Collection Section */}
{/* NFT Collection Section */}
<h4 className="center-align" style={{ marginTop: "30px" }}>NFT Collections</h4>
<div className="row">
  {[
    { id: 1, price: "1.909 ETH", image: "/images/nft1.jpg" },
    { id: 2, price: "1.999 ETH", image: "/images/nft2.jpg" },
    { id: 3, price: "1.990 ETH", image: "/images/nft3.jpg" }
  ].map((nft) => (
    <div className="col s12 m4" key={nft.id}>
      <div className="card z-depth-3">
        <div className="card-image" style={{ position: "relative" }}>
          <img src={nft.image} alt={`NFT ${nft.id}`} style={{ height: "150px", objectFit: "cover" }} />
          <span
            className="card-title"
            style={{
              background: "rgba(255, 255, 255, 0.7)", // Semi-transparent white background
              color: "black", // Black text
              padding: "5px 10px",
              borderRadius: "5px",
              position: "absolute",
              bottom: "10px",
              left: "10px",
            }}
          >
            Name
          </span>
        </div>
        <div className="card-content" style={{ color: "black" }}>
          <p><strong>Status:</strong> Completed</p>
          <p><strong>Price:</strong> {nft.price}</p>
        </div>
      </div>
    </div>
  ))}
</div>

    </div>
  );
};

export default NFTCollection;
