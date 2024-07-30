import React from "react";
import {ConfigProvider } from "antd";
import {Outlet} from "@@/exports";

export type indexProps = {};
export const colorPrimary = '#818cf8';

const Theme: React.FC<indexProps> = (props) => {
  return (<>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary,
        },
      }}
    >
      <Outlet/>
    </ConfigProvider>
  </>);
};

export default React.memo(Theme)


export const ThemeProvider: React.FC = (props) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary,
        },
      }}
    >
      {props.children}
    </ConfigProvider>);
}