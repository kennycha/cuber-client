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

## 3.5 Connecting Local State to Components

- `AppContainer` 에게 현재 로그인 유무를 어떻게 알려줄 수 있을까

  - client의 `clientState` 에서 `isLoggedIn` 을 체크

    - apollo-boost의 `gql` 을 사용해 Query 작성

    - 이때, 서버가 아닌 클라이언트(cache)로 Query를 날리므로, 쿼리에 `@client` 를 붙여서 명시해야 한다

      ```typescript
      import { gql } from "apollo-boost";
      
      export const IS_LOGGED_IN = gql`
        {
          auth {
            isLoggedIn @client
          }
        }
      `;
      ```

  - 연결

    - 작성된 쿼리를 AppContainer 에 불러와, react-apollo의 `graphql` 을 통해 적용

      ```tsx
      // AppContainer.tsx
      
      import React from "react";
      import { graphql } from "react-apollo";
      import { IS_LOGGED_IN } from "./AppQueries";
      
      const AppContainer = ({ data }) => (<div>{JSON.stringify(data)}</div>);
      
      export default graphql(IS_LOGGED_IN)(AppContainer);
      ```

## 3.6 Typescript and React Components

- Component 구조

  ```
  Components
  │- App
  │  │- AppContainer.tsx
  │  │- AppPresenter.tsx
  │  │- AppQueries.ts
  │  └- index.ts
  │- ...
  ```

  - 개별 component 폴더 내에 `Container` , `Presenter` , `index` 와 필요한 경우 `Queries` 파일들로 구성
  - index는 폴더 구조에서 자동으로 render되는 역할
  - Queries는 query나 mutation을 작성하는 역할
  - Container는 Queries 를 불러와 데이터 작업을 하고 Presenter에 연결하는 역할
  - Presenter는 보여지는 역할

- typescript and react components

  - `interface` 를 통해 component의 type을 정의

  - 이때, react의 function component는 `React.FC<interface명>`  type

    ```tsx
    import React from "react";
    import PropTypes from "prop-types";
    
    interface IProps {
      isLoggedIn: boolean;
    }
    
    const AppPresenter: React.FC<IProps> = ({ isLoggedIn }) =>
      isLoggedIn ? <span>You are in</span> : <span>You are out</span>;
    
    AppPresenter.propTypes = {
      isLoggedIn: PropTypes.bool.isRequired,
    };
    
    export default AppPresenter;
    ```

  - `prop-types` 를 통해 타입 확인 추가

    - [prop-types](https://ko.reactjs.org/docs/typechecking-with-proptypes.html)
    - interface를 정의한 덕에 더 쉽게 설정 가능

  - 만약 typescript 를 통해 type을 설정하지 않았다면, runtime 환경에서야 `prop-types` 를 통해 잘못을 발견할 수 있었을 것

## 3.7~8 Typescript and Styled Components

- Setup for `@types/styled-components`

  - [styled-components|typescript](https://styled-components.com/docs/api#typescript)

  - 강의에서는 typed-components를 통해 새로 theme을 만들어 선언했지만, `@types/styled-components` 추가 후 직접 추가하는 방식이 가능하다

  - [Reference|setup-styled-components](https://flowkater.io/frontend/setup-styled-components/)

  - 설치

    ```bash
    $ npm i styled-components
    $ npm install @types/styled-components -D
    ```

  - `styled.d.ts`

    ```typescript
    // import original module declarations
    import "styled-components";
    
    // and extend them!
    declare module "styled-components" {
      export interface DefaultTheme {
        borderRadius: string;
    
        colors: {
          main: string;
          secondary: string;
        };
      }
    }
    ```

  - `myTheme.ts`

    ```typescript
    // myTheme.ts
    import { DefaultTheme } from "styled-components";
    
    const myTheme: DefaultTheme = {
      borderRadius: "5px",
    
      colors: {
        main: "cyan",
        secondary: "magenta",
      },
    };
    
    export { myTheme };
    ```

  - component에 적용

    ```tsx
    import React from "react";
    import PropTypes from "prop-types";
    import styled from "styled-components";
    
    const Thing = styled.div`
      background: ${props => props.theme.colors.main}
    `
    ```

- ThemeProvider

  - [styled-components|Theming](https://styled-components.com/docs/advanced#theming)

    - theme을 정의한 후, `ThemeProver` 에 theme props로 넘겨주면, 감싸진 내에서 theme을 사용 가능하다

  - 사용

    ```tsx
    import { ThemeProvider } from "styled-components";
    import { theme } from "../../styles/theme";
    
    const AppContainer = ({ data }) => (
      <ThemeProvider theme={theme}>
        <AppPresenter isLoggedIn={data.auth.isLoggedId} />
      </ThemeProvider>
    );
    ```

- reset styles

  - [npm|styled-reset](https://www.npmjs.com/package/styled-reset)

    - 설치

      ```bash
      $ npm i styled-reset
      ```

    - 사용

      ```tsx
      import React from 'react'
      import { createGlobalStyle } from 'styled-components'
      import reset from 'styled-reset'
       
      const GlobalStyle = createGlobalStyle`
        ${reset}
        /* other styles */
      `
       
      const App = () => (
        <React.Fragment>
          <GlobalStyle />
          <div>Hi, I'm an app!</div>
        </React.Fragment>
      }
       
      export default App
      ```

- TSLint rule flags

  - [TSLint|rule flags](https://palantir.github.io/tslint/usage/rule-flags/) 

  - ex) 

    ```
    /* tslint:disable */ - Disable all rules for the rest of the file
    /* tslint:enable */ - Enable all rules for the rest of the file
    /* tslint:disable:rule1 rule2 rule3... */ - Disable the listed rules for the rest of the file
    /* tslint:enable:rule1 rule2 rule3... */ - Enable the listed rules for the rest of the file
    // tslint:disable-next-line - Disables all rules for the following line
    someCode(); // tslint:disable-line - Disables all rules for the current line
    // tslint:disable-next-line:rule1 rule2 rule3... - Disables the listed rules for the next line
    ```

## 3.9 Global Styles Set Up

- [google fonts](https://fonts.google.com/)

## 3.10 Planning the Routes

### Logged Out:

- [ ] Home
- [ ] Phone Login
- [ ] Verify Phone Number
- [ ] Social Login

---

### Logged In:

- [ ] Home
- [ ] Ride
- [ ] Edit Account
- [ ] Settings
- [ ] Saved Places
- [ ] Add Place
- [ ] Find Address

---

### Challenge: 

- [ ] Ride History

---

## 3.11 Router and Routes

- react-router-dom

  - for page routing

    - [npm|react-router-dom](https://www.npmjs.com/package/react-router-dom)
    - [react-router|basic routing](https://reactrouter.com/web/guides/quick-start)

  - 설치

    ```bash
    $ npm i react-router-dom
    $ npm i @types/react-router-dom -D
    ```

  - `BrowserRouter`

  - `Redirect`

    - 설정된 path 외의 값으로 접근할 때 redirect 

    - ```tsx
      <Redirect from={"*"} to={"/"} />
      ```

  - `Route`

  - `Switch`

    - When a `<Switch>` is rendered, it searches through its `children` `<Route>` elements to find one whose `path` matches the current URL. When it finds one, it renders that `<Route>` and ignores all others. 

- `isLoggedIn` 값에 따라 다른 Routes 사용

  - `LoggedInRoutes`
  - `LoggedOutRoutes`

## 3.12 OutHome Component

- `Container` / `Presenter`

  - state나 data와 component가 연결된 경우에만 Container를 생성
  - 그렇지 않은 경우 Presenter 만으로 충분

- `RouteComponentProps`

  - Route로 연결된 component는 자동으로 props를 가진다

  - history, location, match

  - Route Component 정의 예시

    ```tsx
    import React from "react";
    import { RouteComponentProps } from "react-router-dom";
    
    interface IProps extends RouteComponentProps<any> {}
    
    const OutHomePresenter: React.FC<IProps> = ({}) => <div></div>;
    
    export default OutHomePresenter;
    ```

    - `RouteComponentProps` 를 extends한 `IProps` interface를 통해 FunctionComponent 의 type 정의

## 3.13 Login Component and React Helmet

- `Link`

  - SPA에서 사용하는 `a` 태그

  - 새로고침 하지 않고 이동

  - `to` props 를 통해 이동할 path 지정

  - ```tsx
    import { Link } from "react-router-dom";
    
    <Link to={"/phone-login"}>
      <span>go to phone login</span>
    </Link>
    ```

  - 

- [react-helmet](https://github.com/nfl/react-helmet)

  - 페이지에 따라 사이트 title을 변경할 수 있도록 돕는 패키지

    - title 외에도 Header에 들어가는 내용들 변경 가능 

  - 설치

    ```bash
    $ npm install react-helmet
    ```

  - 사용

    ```tsx
    import Helmet from "react-helmet";
    const LoginPresenter: React.FC<IProps> = () => (
      <Container>
    	<Helmet>
      		<title>Login | Cuber</title>
    	</Helmet>
        // ...
    ```

## 3.14 Route Components Review

- [iconmonstr](https://iconmonstr.com/)
  - `fontawesome`의 경우 몇개의 아이콘을 위해 너무 큰 용량을 잡아먹음
  - `iconmonstr`의  `<Embed>` 를 통해 편하게 아이콘 사용 가능
- [jsoncountries](https://github.com/serranoarevalo/jsoncountries)
  - countries 담긴 json 파일

## 3.15~16 Inputs and Typescript

- `Event Managing with Typescript`

  - `React.이벤트핸들러종류<요소종류>` 의 형식으로 타입 설정

    - `ChangeEventHandler`, `FormEventHandler` 등 이벤트핸들러
    - `HTMLInputElement`, `HTMLSelectElement`, `HTMLFormElement` 등 요소종류

  - ex)

    ```tsx
    const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      const {
        target: { value },
      } = event;
      setPhoneNumber(value);
    };
    const onSelectChange: React.ChangeEventHandler<HTMLSelectElement> = (
      event
    ) => {
      const {
        target: { value },
      } = event;
      setCountryCode(value);
    };
    const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();
      console.log(countryCode, phoneNumber);
    };
    ```

- `React Hooks with Typescript`

  - [velopert|타입스크립트로 리액트 Hooks 사용하기](https://velog.io/@velopert/using-hooks-with-typescript)

  - 강의에서는 클래스 컴포넌트를 사용하고 있어서, 이를 함수형으로 변경해서 작성

  - 컴포넌트 state 관리를 위해 react hooks 사용

  - 이때, state의 type은 정의 단계에서 아래와 같이 generic을 통해 설정

    - 이때, 단순한 자료형의 경우 default 값 등을 통해 typescript가 판단할 수 있어 타입 설정이 필수적이지 않다

    ```tsx
    const PhoneLoginContainer: React.FC<RouteComponentProps<any>> = () => {
      const [countryCode, setCountryCode] = useState<string>("+82");
      const [phoneNumber, setPhoneNumber] = useState<string>("12345");
      return (
        <PhoneLoginPresenter
          countryCode={countryCode}
          phoneNumber={phoneNumber}
        />
      );
    };
    
    export default PhoneLoginContainer
    ```

## 3.17 Notifications with React Toastify

- `react-toastify`

  - [npm|react-toastify](https://www.npmjs.com/package/react-toastify)

  - [React-Toastify|Docs](https://fkhadra.github.io/react-toastify/introduction/)

  - 설치

    ```bash
    $ npm install react-toastify
    ```

  - 적용

    - `AppContainer.tsx` 에서 `AppPresenter` 를 `ToastContainer`로 감싸준다

      ```tsx
      import AppPresenter from "./AppPresenter";
      import "react-toastify/dist/ReactToastify.min.css";
      import StyledToastContainer from "../StyledToastContainer";
      
      const AppContainer = ({ data }) => (
        <>
          <ThemeProvider theme={theme}>
            <GlobalStyle />
            <AppPresenter isLoggedIn={data.auth.isLoggedIn} />
          </ThemeProvider>
          <StyledToastContainer draggable={true} position={"bottom-center"} />
        </>
      );
      ```

    - `styled-components` 를 통한 css customizing 가능

      ```tsx
      const StyledToastContainer = styled(ToastContainer)`
        width: 100%;
      `;
      ```

  - 종류

    - default, info, success, warning, error, dark

- 전화번호 형식 검증

  - 정규표현식을 사용해 전화번호 형식 검증

    ```tsx
    const isValid = /^\+[1-9]{1}[0-9]{7,11}$/.test(
      `${countryCode}${phoneNumber}`
    );
    if (isValid) {
      return;
    } else {
      toast.error("Please write a valid phone number");
    }
    ```

  