import { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

function StompTest() {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [connected, setConnected] = useState(false);
  const [roomKey] = useState("0671py");

  useEffect(() => {
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [stompClient]);

  const connect = () => {
    const socket = new SockJS("/api/connect");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log("[STOMP DEBUG]", str);
        setMessages((prev) => [...prev, { type: "DEBUG", content: str }]);
      },
      onConnect: () => {
        console.log("웹소켓 연결 성공!");
        setConnected(true);
        setMessages((prev) => [
          ...prev,
          { type: "SYSTEM", content: "웹소켓 연결 성공!" },
        ]);

        // 채팅방 메시지 구독
        client.subscribe(`/topic/room/${roomKey}/messages`, (message) => {
          try {
            const data = JSON.parse(message.body);
            setMessages((prev) => [...prev, data]);
          } catch (e) {
            console.error("메시지 파싱 오류:", e);
          }
        });

        // 키워드 전송 결과 구독
        client.subscribe("/user/queue/keyword-confirmation", (message) => {
          try {
            const data = JSON.parse(message.body);
            setMessages((prev) => [...prev, data]);
          } catch (e) {
            console.error("개인 메시지 파싱 오류:", e);
          }
        });

        // 에러 메시지 구독
        client.subscribe("/user/queue/errors", (message) => {
          try {
            const data = JSON.parse(message.body);
            setMessages((prev) => [...prev, data]);
          } catch (e) {
            console.error("에러 메시지 파싱 오류:", e);
          }
        });

        // 입장 메시지 전송
        client.publish({
          destination: `/app/room/${roomKey}/enter`,
          body: "{}",
        });
      },
      onDisconnect: () => {
        console.log("웹소켓 연결 해제");
        setConnected(false);
        setMessages((prev) => [
          ...prev,
          { type: "SYSTEM", content: "웹소켓 연결 해제" },
        ]);
      },
      onStompError: (frame) => {
        console.error("STOMP 에러:", frame);
        setMessages((prev) => [
          ...prev,
          { type: "ERROR", content: `STOMP 에러: ${frame}` },
        ]);
      },
    });

    client.activate();
    setStompClient(client);
  };

  const disconnect = () => {
    if (stompClient) {
      stompClient.deactivate();
      setConnected(false);
    }
  };

  const sendKeyword = () => {
    if (stompClient && keyword) {
      stompClient.publish({
        destination: `/app/room/${roomKey}/keyword`,
        body: JSON.stringify({ keyword }),
      });
      setKeyword("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>STOMP 웹소켓 테스트</h2>

      <div style={{ marginBottom: "20px" }}>
        {!connected ? (
          <button onClick={connect}>연결</button>
        ) : (
          <button onClick={disconnect}>연결 해제</button>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="키워드 입력"
          disabled={!connected}
        />
        <button onClick={sendKeyword} disabled={!connected}>
          키워드 전송
        </button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "400px",
          overflowY: "auto",
        }}
      >
        <h3>메시지 로그:</h3>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <div
              style={{
                color:
                  msg.type === "ERROR"
                    ? "red"
                    : msg.type === "SYSTEM"
                    ? "blue"
                    : msg.type === "DEBUG"
                    ? "gray"
                    : "black",
              }}
            >
              {msg.type && `[${msg.type}] `}
              {msg.nickname && `${msg.nickname}: `}
              {msg.content}
            </div>
            {msg.data && (
              <pre style={{ marginLeft: "20px", fontSize: "0.9em" }}>
                {JSON.stringify(msg.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StompTest;
