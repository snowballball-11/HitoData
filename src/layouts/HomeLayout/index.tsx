import React, {useEffect, useState} from 'react';
import defaultProps from './_defaultProps';
import {history, Link} from "@@/exports";
import {PageContainer, ProCard, ProLayout, ProSettings, WaterMark} from '@ant-design/pro-components';
import {Me} from "@icon-park/react";
import {Dropdown, Menu} from "antd";
import {logout} from "@/utils/request";
import * as cache from "@/utils/cache";
import {useModel} from "@umijs/max";
import useTabStore from "@/store/tab/useTabStore";
import Theme, { ThemeProvider } from "@/components/Theme";
import {LogoutOutlined, UserOutlined} from "@ant-design/icons";
import { colorPrimary } from "@/components/Theme";


export interface HomeLayoutLayoutProps {
  children: any;
}

export const menuHeaderDropdown = (
  <Menu selectedKeys={[]}>
    <Menu.Item key="center" onClick={()=>{
      history.push("/account/settings?selectKey=base")
    }}>
      <UserOutlined/>
      个人中心
    </Menu.Item>
    <Menu.Divider/>
    <Menu.Item key="vip" onClick={()=>{
      history.push("/account/settings?selectKey=identification")
    }}>
      <UserOutlined/>
      授权信息
    </Menu.Item>
    <Menu.Divider/>

    <Menu.Item key="logout" onClick={() => {
      logout();
    }}>
      <LogoutOutlined/>
      退出登录
    </Menu.Item>
  </Menu>
);

const HomeLayout: React.FC<HomeLayoutLayoutProps> = props => {
  const [pathname, setPathname] = useState('/project/home');
  const {setInitialState} = useModel('@@initialState');
  const {tabDispatch} = useTabStore(state => ({tabDispatch: state.dispatch}));

  useEffect(() => {
    console.log('回首页清空权限');
    tabDispatch.removeAllTab({});
    setInitialState((s: any) => ({...s, access: {}}));
  }, [])

  const settings: ProSettings | undefined = {
    "layout": "mix",
    "navTheme": "light",
    "contentWidth": "Fluid",
    "fixSiderbar": true,
    "siderMenuType": "group",
    "fixedHeader": true
  };


  const licence = cache.getItem2object('licence');
  console.log(154, licence, licence?.licensedTo, licence.licensedStartTime);

  return (
    <WaterMark content={[licence?.licensedTo?licence?.licensedTo:'HitoData', 'V0.5.0']}>
      <ThemeProvider>
      <ProLayout
        logo={"/logo.svg"}
        title={"HitoData"}
        {...defaultProps}
        location={{
          pathname,
        }}
        avatarProps={{
          src: <Me theme="filled" size="28" fill={colorPrimary} strokeWidth={2}/>,
          title: <Dropdown
            placement="bottom"
            arrow={{pointAtCenter: true}}
            overlay={menuHeaderDropdown}>
            <div>{cache.getItem('username')}</div>
          </Dropdown>,
        }}
        actionsRender={(props) => {
          return [];
        }}
        menuFooterRender={(props) => {
          if (props?.collapsed) return undefined;
          return (
            <div
              style={{
                textAlign: 'center',
                paddingBlockStart: 12,
              }}
            >
              <div>星辰大海，前途可思</div>
              <br/>
              <div>© 2024 made with HitoX</div>
              <div>HitoData</div>
            </div>
          );
        }}
        onMenuHeaderClick={(e) => history.push("/")}
        menuItemRender={(item, dom) => (
          item.path?.startsWith('http') || item.exact ?
            <a href={item?.path || '/project'} target={'_blank'}>{dom}</a>
            :

            <div
              onClick={() => {
                console.log(153, item);
                setPathname(item.path || '/project');
              }}
            >
              <Link to={item?.path || '/project'}>{dom}</Link>
            </div>
        )}
        {...settings}
      >
        <PageContainer
          title={false}
        >
          <ProCard
            style={{
              minHeight: '85vh',
            }}
          >
            <Theme/>
          </ProCard>
        </PageContainer>
      </ProLayout>
      </ThemeProvider>
    </WaterMark>
  );
}
export default React.memo(HomeLayout);
