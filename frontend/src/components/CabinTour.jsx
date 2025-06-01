import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls, Box } from "@react-three/drei";
import styles from "./CabinTour.module.css";

function Cabin({ selectedSeat, onSeatSelect, flightId }) {
  const CABIN_WIDTH = 12;
  const CABIN_LENGTH = 40;
  const CABIN_HEIGHT = 3;
  const WINDOW_SIZE = 1;
  const WINDOWS_PER_SIDE = 15;
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch occupied seats
  useEffect(() => {
    const fetchOccupiedSeats = async () => {
      if (!flightId) {
        setOccupiedSeats([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/check-in/flights/${flightId}/booked-seats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch booked seats");
        }

        const data = await response.json();
        setOccupiedSeats(data);
      } catch (err) {
        console.error("Error fetching booked seats:", err);
        // Fallback to empty array if API fails
        setOccupiedSeats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupiedSeats();
  }, [flightId]);

  // Create a window component to keep the code DRY
  const Window = ({ position, rotation }) => (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[WINDOW_SIZE, WINDOW_SIZE]} />
      <meshStandardMaterial
        color={0x87ceeb}
        emissive={0x87ceeb}
        emissiveIntensity={0.2}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );

  // Create a seat component to keep the code DRY
  const Seat = ({ position, isSelected, seatNumber }) => {
    const isOccupied = occupiedSeats.includes(seatNumber);

    const handleClick = (e) => {
      e.stopPropagation();
      if (!isOccupied && onSeatSelect) {
        onSeatSelect(seatNumber);
      }
    };

    return (
      <group position={position} rotation={[0, Math.PI, 0]}>
        {/* Seat base */}
        <Box
          args={[0.8, 0.4, 0.8]}
          position={[0, 0.2, 0]}
          castShadow
          onClick={handleClick}
        >
          <meshStandardMaterial
            color={isOccupied ? 0xff0000 : isSelected ? 0xff6f00 : 0x2196f3}
            emissive={isSelected ? 0xff6f00 : 0x000000}
            emissiveIntensity={isSelected ? 0.5 : 0}
            opacity={isOccupied ? 0.7 : 1}
            transparent={isOccupied}
          />
        </Box>
        {/* Seat back */}
        <Box
          args={[0.8, 1.2, 0.2]}
          position={[0, 0.9, 0.3]}
          castShadow
          onClick={handleClick}
        >
          <meshStandardMaterial
            color={isOccupied ? 0xff0000 : isSelected ? 0xff6f00 : 0x2196f3}
            emissive={isSelected ? 0xff6f00 : 0x000000}
            emissiveIntensity={isSelected ? 0.5 : 0}
            opacity={isOccupied ? 0.7 : 1}
            transparent={isOccupied}
          />
        </Box>
        {/* Armrests */}
        <Box
          args={[0.1, 0.4, 0.6]}
          position={[-0.45, 0.4, 0]}
          castShadow
          onClick={handleClick}
        >
          <meshStandardMaterial
            color={0x666666}
            opacity={isOccupied ? 0.7 : 1}
            transparent={isOccupied}
          />
        </Box>
        <Box
          args={[0.1, 0.4, 0.6]}
          position={[0.45, 0.4, 0]}
          castShadow
          onClick={handleClick}
        >
          <meshStandardMaterial
            color={0x666666}
            opacity={isOccupied ? 0.7 : 1}
            transparent={isOccupied}
          />
        </Box>
      </group>
    );
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, CABIN_HEIGHT - 0.5, 0]} intensity={0.5} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CABIN_WIDTH, CABIN_LENGTH]} />
        <meshStandardMaterial color={0x404040} roughness={0.8} />
      </mesh>

      {/* Left Wall with Windows */}
      <mesh
        position={[-CABIN_WIDTH / 2, CABIN_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[CABIN_LENGTH, CABIN_HEIGHT]} />
        <meshStandardMaterial color={0xeeeeee} side={THREE.DoubleSide} />
      </mesh>

      {/* Left Wall Windows */}
      {Array.from({ length: WINDOWS_PER_SIDE }, (_, i) => (
        <Window
          key={`left-window-${i}`}
          position={[
            -CABIN_WIDTH / 2 + 0.01,
            CABIN_HEIGHT / 2,
            CABIN_LENGTH / 2 - 2 - (i * CABIN_LENGTH) / WINDOWS_PER_SIDE,
          ]}
          rotation={[0, Math.PI / 2, 0]}
        />
      ))}

      {/* Right Wall with Windows */}
      <mesh
        position={[CABIN_WIDTH / 2, CABIN_HEIGHT / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[CABIN_LENGTH, CABIN_HEIGHT]} />
        <meshStandardMaterial color={0xeeeeee} side={THREE.DoubleSide} />
      </mesh>

      {/* Right Wall Windows */}
      {Array.from({ length: WINDOWS_PER_SIDE }, (_, i) => (
        <Window
          key={`right-window-${i}`}
          position={[
            CABIN_WIDTH / 2 - 0.01,
            CABIN_HEIGHT / 2,
            CABIN_LENGTH / 2 - 2 - (i * CABIN_LENGTH) / WINDOWS_PER_SIDE,
          ]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      ))}

      {/* Ceiling */}
      <mesh position={[0, CABIN_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CABIN_WIDTH, CABIN_LENGTH]} />
        <meshStandardMaterial color={0xeeeeee} side={THREE.DoubleSide} />
      </mesh>

      {/* Front and back walls */}
      <mesh position={[0, CABIN_HEIGHT / 2, -CABIN_LENGTH / 2]}>
        <planeGeometry args={[CABIN_WIDTH, CABIN_HEIGHT]} />
        <meshStandardMaterial color={0xeeeeee} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        position={[0, CABIN_HEIGHT / 2, CABIN_LENGTH / 2]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[CABIN_WIDTH, CABIN_HEIGHT]} />
        <meshStandardMaterial color={0xeeeeee} side={THREE.DoubleSide} />
      </mesh>

      {/* Seats */}
      {Array.from({ length: 30 }, (_, row) =>
        Array.from({ length: 6 }, (_, col) => {
          const seatNumber = `${row + 1}${String.fromCharCode(65 + col)}`;
          const isSelected = selectedSeat === seatNumber;

          // Adjust seat positioning - mirror the x-position to match seatmap
          const xPos = -(col - 2.5) * 1.5;
          const aisleGap = col >= 3 ? -1.5 : 0;
          const finalXPos = xPos + aisleGap;

          // Adjust row spacing and starting position
          const zPos = CABIN_LENGTH / 2 - 2 - row * 1.2;

          // Only render if within cabin bounds
          if (
            Math.abs(finalXPos) < CABIN_WIDTH / 2 - 0.5 &&
            zPos > -(CABIN_LENGTH / 2 - 0.5) &&
            zPos < CABIN_LENGTH / 2 - 0.5
          ) {
            return (
              <Seat
                key={seatNumber}
                position={[finalXPos, 0, zPos]}
                isSelected={isSelected}
                seatNumber={seatNumber}
              />
            );
          }
          return null;
        })
      )}
    </>
  );
}

function Controls() {
  const { camera } = useThree();
  const controlsRef = useRef();
  const [moveState, setMoveState] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!controlsRef.current?.isLocked) return;
      setMoveState((prev) => {
        switch (e.code) {
          case "KeyW":
            return { ...prev, forward: true };
          case "KeyS":
            return { ...prev, backward: true };
          case "KeyA":
            return { ...prev, left: true };
          case "KeyD":
            return { ...prev, right: true };
          default:
            return prev;
        }
      });
    };

    const handleKeyUp = (e) => {
      if (!controlsRef.current?.isLocked) return;
      setMoveState((prev) => {
        switch (e.code) {
          case "KeyW":
            return { ...prev, forward: false };
          case "KeyS":
            return { ...prev, backward: false };
          case "KeyA":
            return { ...prev, left: false };
          case "KeyD":
            return { ...prev, right: false };
          default:
            return prev;
        }
      });
    };

    const handleClick = () => {
      if (!controlsRef.current?.isLocked) {
        controlsRef.current?.lock();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useFrame(() => {
    if (!controlsRef.current?.isLocked) return;

    const speed = 0.08;
    if (moveState.forward) controlsRef.current.moveForward(speed);
    if (moveState.backward) controlsRef.current.moveForward(-speed);
    if (moveState.left) controlsRef.current.moveRight(-speed);
    if (moveState.right) controlsRef.current.moveRight(speed);

    // Updated constraints to match new cabin dimensions
    const padding = 0.5;
    camera.position.x = Math.max(-5.5, Math.min(5.5, camera.position.x));
    camera.position.z = Math.max(-19.5, Math.min(19.5, camera.position.z));
    camera.position.y = 1.7; // Keep at eye level
  });

  return <PointerLockControls ref={controlsRef} />;
}

const CabinTour = ({ selectedSeat, onSelectSeat, flightId }) => {
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(!!document.pointerLockElement);
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () => {
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
    };
  }, []);

  return (
    <div className={styles.cabinTourContainer}>
      <div className={styles.tourControls}>
        <h3>Cabin Tour</h3>
        <p>Controls:</p>
        <ul>
          <li>Click to start looking around</li>
          <li>WASD keys to move</li>
          <li>Mouse to look around</li>
          <li>Left click to select a seat</li>
          <li>ESC to exit</li>
        </ul>
      </div>
      <div className={styles.cabinTourCanvas}>
        {/* Crosshair */}
        <div className={styles.crosshair}>+</div>
        <Canvas shadows camera={{ fov: 75, position: [0, 1.7, 0] }}>
          <Cabin
            selectedSeat={selectedSeat}
            onSeatSelect={(seatNumber) => {
              if (isPointerLocked) {
                onSelectSeat(seatNumber);
              }
            }}
            flightId={flightId}
          />
          <Controls />
        </Canvas>
      </div>
    </div>
  );
};

export default CabinTour;
