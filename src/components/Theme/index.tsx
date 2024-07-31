import React from "react";
import {ConfigProvider} from "antd";
import {Outlet} from "@@/exports";

export type indexProps = {};
export const colorPrimary = '#818cf8';

const token = {
  colorPrimary,
  colorInfo: colorPrimary,
  colorLink: colorPrimary,
};

const Theme: React.FC<indexProps> = (props) => {
  return (<>
    <ConfigProvider
      theme={{
        token,
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
        token,
      }}
    >
      {props.children}
    </ConfigProvider>);
}