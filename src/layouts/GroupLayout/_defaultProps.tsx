import {DatabaseNetwork, LeftC, Permissions, SettingOne, Sphere} from "@icon-park/react";
import { colorPrimary } from "@/components/Theme";

export default {
  route: {
    path: '/',
    routes: [
      {
        path: '/project/group',
        name: '返回项目列表',
        icon: <LeftC theme="filled" size="18" fill={colorPrimary} strokeWidth={2} strokeLinejoin="miter"/>,
      },
      {
        path: '/project/group/setting/basic',
        name: '基本设置',
        icon: <SettingOne theme="filled" size="18" fill={colorPrimary} strokeWidth={2} strokeLinejoin="miter"/>,
      },
      {
        path: '/project/group/setting/permission',
        name: '权限组',
        icon: <Permissions theme="filled" size="18" fill={colorPrimary} strokeWidth={2} strokeLinejoin="miter"/>,
        access: 'canErdProjectPermissionGroup'
      },
      {
        path: '/design/table/model',
        name: '打开模型',
        icon: <DatabaseNetwork theme="filled" size="18" fill={colorPrimary} strokeWidth={2}/>,
      },
    ],
  },
  location: {
    pathname: '/',
  },
  appList: [
  ],
};
