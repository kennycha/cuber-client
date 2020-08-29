# CUBER Client

## 3.0 Create React App with TypeScript

- [CRA|Add TypeScript](https://create-react-app.dev/docs/adding-typescript/)

  - 설치

    ```bash
    $ npx create-react-app my-app --template typescript
    ```

  - 필요한 packages

    ```bash
    $ npm install --save typescript @types/node @types/react @types/react-dom @types/jest
    ```

## 3.1~4 Apollo Setup

- [Apollo client](https://www.apollographql.com/docs/react/get-started/)

  - graphql 과 소통하기 위한 클라이언트
    - cf) redux for graphql

- [Apollo boost](https://www.npmjs.com/package/apollo-boost)

  - apollo client를 쉽게 만들 수 있는 패키지

    - cf) graphql-yoga의 역할

  - 설치

    ```bash
    $ npm i apollo-boost graphql react-apollo
    ```

- client 생성 및 설정

  ```typescript
  // apollo.ts
  
  import ApolloClient from "apollo-boost";
  
  const client = new ApolloClient({
    uri: "http://localhost:4000/graphql",
  });
  
  export default client;
  ```

  - `ApolloClient` 를 가져와 인스턴스 생성
  - 생성 시 option으로 uri에 graphql endpoint를 넘겨줌

- client 적용

  ```tsx
  // index.tsx
  
  import React from "react";
  import ReactDOM from "react-dom";
  import { ApolloProvider } from "react-apollo";
  import App from "./App";
  import client from "./apollo";
  
  ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById("root")
  );
  ```

  - `ApolloProvider` 로 App을 감싸줌
  - 이때 ApolloProvider에 ApolloClient인스턴스를 함께 넘겨줌

- authentication setting

  ```typescript
  // apollo.ts
  
  import ApolloClient, { Operation } from "apollo-boost";
  
  const client = new ApolloClient({
    request: async (operation: Operation) => {
      operation.setContext({
        headers: {
          "X-JWT": localStorage.getItem("jwt") || "",
        },
      });
    },
    uri: "http://localhost:4000/graphql",
  });
  
  export default client;
  ```

  - JWT 사용
    - request 보낼 때, 어떻게 JWT를 담아서 보내는지
  - request function
    - [apollographql|authentication](https://www.apollographql.com/docs/react/networking/authentication/#header)
    - [apollo-boost|authentication with request](https://github.com/apollographql/apollo-client/issues/5229)
    - 클라이언트 생성 시 옵션에 `request func` 을 설정 가능
      - 클라이언트가 request를 보낼 때 마다 호출되는 함수
      - request `operation`에 대한 접근 및 수정 가능
    - `setContext()`를 통해 operation의 attribute 설정
      - request를 보내기 전에, headers에 `'X-JWT'` 를 담아서 보냄
      - 이때, client의 `localStorage`에 `'jwt'` 값이 있다면 이를 사용하고, 없다면 빈 str을 담는다

- clientState 설정

  - [apollographql|state management](https://www.apollographql.com/docs/react/v2.4/essentials/local-state/)
  - clinet 정의 시, clientState 설정
  - clientState는 초기 state인 `defaults` 와 state를 변경하는`resolvers` 를 포함 (`typeDefs`도 있지만 지금은 설정하지 않음)

- clientState about authentication

  ```typescript
  import ApolloClient, { Operation } from "apollo-boost";
  
  const client = new ApolloClient({
    clientState: {
      defaults: {
        auth: {
          __typename: "Auth",
          isLoggedIn: Boolean(localStorage.getItem("jwt")),
        },
      },
      resolvers: {
        Mutation: {
          logUserIn: (_, { token }, { cache }) => {
            localStorage.setItem("jwt", token);
            cache.writeDate({
              data: {
                auth: {
                  __typename: "Auth",
                  isLoggedIn: true,
                },
              },
            });
            return null;
          },
          logUserOut: (_, __, { cache }) => {
            localStorage.removeItem("jwt");
            cache.writeData({
              data: {
                auth: {
                  __typename: "Auth",
                  isLoggedIn: false,
                },
              },
            });
          },
        },
      },
    },
    // ...
  });
  
  export default client;
  ```

  - `defaults` 
    - __typename 과 isLoggedIn을 가지는 객체 auth
    - __typename은 'Auth'
    - isLoggedIn은 localStorage에 'jwt'가 존재하는지로 판단
  - `resolvers`
    - state에 대한 Query와 Mutation들 정의
    - resolver 정의와 모양이 유사
      - ex) function params는 차례대로, (`parent`, `args`, `context`)
    - auth 에 관한 2가지 Mutation 정의
      - `logUserIn` : args.token을 localStorage에 'jwt' 로 추가하고, context의 cache (state) data 를 `writeData()`를 사용해 변경
      - `logUserOut` : localStorage에서 'jwt'를 삭제하고, context의 cache에 있는 data를 `writeData()`를 사용해 변경

