import { useState } from "react";
import axios from "axios";

function Login() {
  const [roomInfo, setRoomInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      // 로그인 요청
      await axios.post(
        "/api/rooms/0671py/member",
        {
          nickname: "test2",
          password: "123ddd@",
        },
        {
          withCredentials: true,
        }
      );

      // 로그인 성공 후 방 정보 가져오기
      const roomResponse = await axios.get("/api/rooms/0671py", {
        withCredentials: true,
      });

      setRoomInfo(roomResponse.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setRoomInfo(null);
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>로그인</button>

      {error && <p style={{ color: "red" }}>에러: {error}</p>}

      {roomInfo && (
        <div>
          <h2>방 정보:</h2>
          <pre>{JSON.stringify(roomInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Login;
