import Login from "./Login";
import StompTest from "./StompTest";

function App() {
  return (
    <div>
      <h1>로그인 테스트</h1>
      <Login />
      <hr style={{ margin: "20px 0" }} />
      <StompTest />
    </div>
  );
}

export default App;
