import logo from "./logo.svg";
import "./App.css";
import { pb } from "./utils/pocketbase";
import { useEffect, useRef, useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (!pb.authStore.isValid)
        return pb.collection("users").authWithOAuth2({ provider: "google" });

      // after the above you can also access the auth data from the authStore
      console.log(pb.authStore.isValid);
      console.log(pb.authStore.token);
      console.log(pb.authStore.model.id);

      pb.collection("todos").subscribe("*", updateTodos);
      updateTodos();
      // "logout" the last authenticated model
      // pb.authStore.clear();
    })();
  }, [pb.authStore.isValid]);

  const updateTodos = async () => {
    const records = await pb.collection("todos").getList(1, 50, {
      sort: "-created",
      filter: `owner.id='${pb.authStore.model.id}'`,
    });
    console.log(records);
    setTodos(records.items || []);
    inputRef.current.value = "";
  };

  const addTodo = () =>
    pb.collection("todos").create({
      completed: false,
      text: inputRef.current.value,
      owner: pb.authStore.model.id,
    });

  const deleteTodo = (id) => () => pb.collection("todos").delete(id);

  const updateTodo = (id, current) => () =>
    pb.collection("todos").update(id, { completed: !current.completed });

  return (
    <div className="App">
      <h1>Todo App pocketbase</h1>

      <div class="container">
        <div id="newtask">
          <input type="text" placeholder="Task to be done.." ref={inputRef} />
          <button onClick={addTodo}>Add</button>
        </div>
        <div id="tasks">
          {todos.map((todo, index) => (
            <div
              key={index}
              className={todo.completed ? "task completed" : "task"}
            >
              <span id="taskname" onClick={updateTodo(todo.id, todo)}>
                {todo.text}
              </span>
              <button class="delete" onClick={deleteTodo(todo.id)}>
                x
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
