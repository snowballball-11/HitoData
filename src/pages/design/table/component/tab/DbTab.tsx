import React from 'react';
import TableCodeShow from "@/pages/design/table/component/table/TableCodeShow";
import {ModuleEntity} from "@/store/tab/useTabStore";
import {Tabs} from "antd";

const {TabPane} = Tabs;

export type DbTabProps = {
  dbCode: string;
  moduleEntity: ModuleEntity
};

const DbTab: React.FC<DbTabProps> = (props) => {
  const {dbCode, moduleEntity} = props;
  console.log(15, dbCode, moduleEntity);
  return (
    <>
      <Tabs
        key="dbNav"
        destroyInactiveTabPane
      >
        <TabPane key="createTableTemplate" tab="创建表">
          <TableCodeShow dbCode={dbCode} templateCode="createTableTemplate" moduleEntity={moduleEntity}/>
        </TabPane>
        <TabPane key="updateTableTemplate" tab="表注释">
          <TableCodeShow dbCode={dbCode} templateCode="updateTableComment" moduleEntity={moduleEntity}/>
        </TabPane>
        <TabPane key="deleteTableTemplate" tab="删除表">
          <TableCodeShow dbCode={dbCode} templateCode="deleteTableTemplate" moduleEntity={moduleEntity}/>
        </TabPane>
        <TabPane key="createIndexTemplate" tab="创建索引" closable>
          <TableCodeShow dbCode={dbCode} templateCode="createIndexTemplate" moduleEntity={moduleEntity}/>
        </TabPane>
        <TabPane key="rebuildTableTemplate" tab={"重建表"}>
          <TableCodeShow dbCode={dbCode} templateCode="rebuildTableTemplate" moduleEntity={moduleEntity}/>
        </TabPane>
        <TabPane key="createFieldTemplate" tab="添加字段">
          <TableCodeShow dbCode={dbCode} templateCode="createFieldTemplate" moduleEntity={moduleEntity}/>
        </TabPane>
        <TabPane key="deleteFieldTemplate" tab="修改字段">
          <TableCodeShow dbCode={dbCode} templateCode="deleteFieldTemplate" moduleEntity={moduleEntity}/>
        </TabPane>
        <TabPane key="updateFieldTemplate" tab="删除字段">
          <TableCodeShow dbCode={dbCode} templateCode="updateFieldTemplate" moduleEntity={moduleEntity}/>
        </TabPane>
        <TabPane key="deleteIndexTemplate" tab="删除索引">
          <TableCodeShow dbCode={dbCode} templateCode="deleteIndexTemplate" moduleEntity={moduleEntity}/>
        </TabPane>
        <TabPane key="createPkTemplate" tab="创建主键">
          <TableCodeShow dbCode={dbCode} templateCode="createPkTemplate" moduleEntity={moduleEntity}/>
        </TabPane>
        <TabPane key="deletePkTemplate" tab="删除主键">
          <TableCodeShow dbCode={dbCode} templateCode="deletePkTemplate" moduleEntity={moduleEntity}/>
        </TabPane>
      </Tabs>
    </>
  );
}

export default React.memo(DbTab)
