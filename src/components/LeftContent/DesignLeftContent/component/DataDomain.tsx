import React, {useRef} from 'react';
import useProjectStore from "@/store/project/useProjectStore";
import shallow from "zustand/shallow";
import AddDataType from "@/components/dialog/dataType/AddDataType";
import RemoveDataType from "@/components/dialog/dataType/RemoveDataType";
import AddDatabase from "@/components/dialog/database/AddDatabase";
import RemoveDatabase from "@/components/dialog/database/RemoveDatabase";
import {Dropdown, Menu, Tree} from "antd";
import RenameDataType from "@/components/dialog/dataType/RenameDataType";
import RenameDatabase from "@/components/dialog/database/RenameDatabase";
import {EditOutlined} from "@ant-design/icons";


export type DataDomainProps = {};

const DataDomain: React.FC<DataDomainProps> = (props) => {
  const {datatype, database, projectDispatch} = useProjectStore(state => ({
    database: state.project?.projectJSON?.dataTypeDomains?.database,
    datatype: state.project?.projectJSON?.dataTypeDomains?.datatype,
    projectDispatch: state.dispatch,
  }), shallow);
  console.log('datatype', 115, datatype, database)

  const activeDataTypeOrDatabase = (t: string, m: string) => {
    console.log('t', 68, t);
    console.log('m', 69, m);
    if (t === "dataType") {
      projectDispatch.setCurrentDatatype(m);
    } else if (t === "database") {
      projectDispatch.setCurrentDatabase(m);
    }
  }

  const dataTypeRef = useRef();
  const activeDataTypePanel = () => {
    // @ts-ignore
    dataTypeRef.current.setModalVisit(true);
  }
  const databaseRef = useRef();
  const activeDatabasePanel = () => {
    // @ts-ignore
    databaseRef.current.setModalVisit(true);
  }


  const renderDataTypeRightContext = () => <Menu mode="inline">
      <AddDataType moduleDisable={false}/>
      <Menu.Item icon={<EditOutlined/>} onClick={() => {
        activeDataTypePanel();
      }}>修改字段类型</Menu.Item>
      <RemoveDataType disable={false}/>
      {/*  <MenuItem icon="duplicate" text="复制字段类型"/>
        <MenuItem icon="cut" text="剪切字段类型"/>
        <MenuItem icon="clipboard" text="粘贴字段类型"/>*/}
    </Menu>
  ;
  const renderDatabaseRightContext = () => <Menu mode="inline">
      <AddDatabase moduleDisable={false}/>
      <Menu.Item icon={<EditOutlined/>} onClick={() => {
        activeDatabasePanel();
      }}>修改数据源</Menu.Item>
      <RemoveDatabase disable={false}/>
      {/*   <MenuItem icon="duplicate" text="复制数据源"/>
        <MenuItem icon="cut" text="剪切数据源"/>
        <MenuItem icon="clipboard" text="粘贴数据源"/>*/}
    </Menu>
  ;

  const renderContext = (code: string, type: string) => {
    if (code === '###menu###') {
      return type === "database" ? <AddDatabase moduleDisable={false}/> : <AddDataType moduleDisable={false}/>;
    }
    return type === "database" ? renderDatabaseRightContext() : renderDataTypeRightContext();
  }

  return (<div>
    <Tree
      showIcon={false}
      height={550}
      defaultExpandedKeys={['database###database']}
      blockNode={true}
      rootStyle={{textAlign: 'left'}}
      treeData={projectDispatch.getDataTypeTree('')}
      titleRender={(node: any) => {
        console.log(154, 'node', node);
        return <Dropdown trigger={['contextMenu']}
                         overlay={renderContext(node.code, node.type)}
        >
          <li>{node.title}</li>
        </Dropdown>
      }}
      onClick={(e, node: any) => {
        console.log(224, 'node', node);
        if (node.type === "dataType" && node.code != '###menu###') {
          activeDataTypeOrDatabase("dataType", node.code);
          activeDataTypePanel();
        } else if (node.type === "database" && node.code != '###menu###') {
          activeDataTypeOrDatabase("database", node.code);
          activeDatabasePanel();
        }
      }}
    >
    </Tree>
    <RenameDataType onRef={dataTypeRef}/>
    <RenameDatabase onRef={databaseRef}/>
  </div>)
    ;
}

export default React.memo(DataDomain);
