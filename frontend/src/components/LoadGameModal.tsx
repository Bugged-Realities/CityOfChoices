import React from "react";

interface LoadGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: () => void;
  savedGameData: any;
  loading: boolean;
}

const LoadGameModal: React.FC<LoadGameModalProps> = ({
  isOpen,
  onClose,
  onLoad,
  savedGameData,
  loading,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "24px",
          borderRadius: "8px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#ecf0f1" }}>
          🎮 Load Saved Game
        </h2>

        {savedGameData ? (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "#3498db", marginBottom: "10px" }}>
                Saved Game Details
              </h3>

              <div style={{ marginBottom: "15px" }}>
                <strong>Current Stage:</strong>{" "}
                <span style={{ color: "#f39c12" }}>
                  {savedGameData.current_stage || "Unknown"}
                </span>
              </div>

              {savedGameData.current_stats && (
                <div style={{ marginBottom: "15px" }}>
                  <strong>Character Stats:</strong>
                  <div style={{ marginLeft: "15px", marginTop: "5px" }}>
                    <div>Fear: {savedGameData.current_stats.fear || 0}</div>
                    <div>Sanity: {savedGameData.current_stats.sanity || 0}</div>
                  </div>
                </div>
              )}

              {savedGameData.inventory_snapshot &&
                savedGameData.inventory_snapshot.length > 0 && (
                  <div style={{ marginBottom: "15px" }}>
                    <strong>Inventory Items:</strong>
                    <div style={{ marginLeft: "15px", marginTop: "5px" }}>
                      {savedGameData.inventory_snapshot.map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            style={{ color: item.used ? "#95a5a6" : "#2ecc71" }}
                          >
                            {item.item_name} {item.used && "(used)"}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {savedGameData.choice_history &&
                savedGameData.choice_history.length > 0 && (
                  <div style={{ marginBottom: "15px" }}>
                    <strong>Choice History:</strong>
                    <div
                      style={{
                        marginLeft: "15px",
                        marginTop: "5px",
                        fontSize: "0.9em",
                      }}
                    >
                      {savedGameData.choice_history.length} choices made
                    </div>
                  </div>
                )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#95a5a6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={onLoad}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load Game"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: "#e74c3c", marginBottom: "20px" }}>
              No saved game found. Start a new game to create a save point.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                backgroundColor: "#95a5a6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadGameModal;
