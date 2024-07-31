import React, {useEffect, useRef, useState} from 'react';
import {
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormGroup,
  ProFormInstance,
  ProFormList,
  ProFormRadio,
  ProFormSelect,
  ProFormText
} from "@ant-design/pro-components";
import _ from "lodash";
import useProjectStore from "@/store/project/useProjectStore";
import shallow from "zustand/shallow";
import {uuid} from '@/utils/uuid';
import {DeleteOutlined} from '@ant-design/icons';
import {Button, Divider, message, Popconfirm} from 'antd';
import * as Save from '@/utils/save';

export type DatabaseSetUpProps = {};


const DatabaseSetUp: React.FC<DatabaseSetUpProps> = (props) => {
  const {projectDispatch, currentDbKey, tempDBs, database} = useProjectStore(state => ({
    projectDispatch: state.dispatch,
    currentDbKey: state.currentDbKey,
    tempDBs: state.project.projectJSON?.profile?.dbs || [],
    database: state.project.projectJSON?.dataTypeDomains?.database || [],
  }), shallow);


  console.log(36, 'tempDBs', tempDBs);


  const url = {
    mysql: {
      url: 'jdbc:mysql://IP地址:端口号/数据库名?characterEncoding=UTF-8&useSSL=false&useUnicode=true&serverTimezone=UTC',
      driver_class_name: 'com.mysql.jdbc.Driver',
    },
    oracle: {
      url: 'jdbc:oracle:thin:@IP地址:端口号/数据库名',
      driver_class_name: 'oracle.jdbc.driver.OracleDriver',
    },
    sqlserver: {
      url: 'jdbc:sqlserver://IP地址:端口号;DatabaseName=数据库名',
      driver_class_name: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
    },
    postgresql: {
      url: 'jdbc:postgresql://IP地址:端口号/数据库名',
      driver_class_name: 'org.postgresql.Driver',
    },
  };

  const defaultDatabase = _.find(database, {"defaultDatabase": true})?.code || database[0]?.code || 'MYSQL';

  const dbName = defaultDatabase.toLocaleLowerCase();
  const defaultDBData = url[dbName] || {};

  const getDefaultDbs = (db: any) => {
    db = db ? db : tempDBs;
    return db.filter((d: any) => d.defaultDB)[0];
  }

  const defaultDbs = getDefaultDbs(null);
  console.log(57, defaultDbs);
  const defaultData = defaultDbs || tempDBs[0];
  console.log(60, defaultData);

  console.log(60, defaultDatabase);

  const [state, setState] = useState({
    loading: false
  });

  const connectJDBC = () => {
    const newVar = formRef && formRef.current?.validateFields();
    console.log(78, newVar);
    newVar?.then(() => {
      const {properties} = defaultData;
      console.log(78, 'properties', properties);
      setState({
        loading: true,
      });
      Save.ping({
        ...properties
      }).then((res: any) => {
        if (res.code !== 200) {
          message.error('连接失败:' + res.msg);
        } else {
          message.success('连接成功');
        }
      }).catch((err) => {
        message.error('连接失败！');
      }).finally(() => {
        setState({
          loading: false,
        });
      });
    });

  };

  // Ant Form 有个臭毛病，form只会加载一次，state变化不会重新加载，用此解决
  const formRef = useRef<ProFormInstance<any>>();
  useEffect(() => {
    console.log('清除form');
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    formRef && formRef.current?.resetFields();
  }, [currentDbKey, tempDBs]);


  const getData = () => {
    return tempDBs.filter((d: any) => d.defaultDB)[0];
  };

  const defaultDB = getData();

  const databaseSelect = database.map((d: any) => {
    return {
      label: d.code,
      value: d.code,
    }
  });


  return (<>
      <ProForm
        formRef={formRef}
        initialValues={{
          ...defaultDbs?.properties,
          dbs: tempDBs
        }}
        // 完全自定义整个区域
        submitter={{
          // 完全自定义整个区域
          render: (props) => {
            console.log(props);
            return _.concat([], [
              <Button type="dashed"
                      onClick={() => {
                        projectDispatch.addDbs({
                          name: '',
                          select: defaultDatabase,
                          key: uuid(),
                          defaultDB: tempDBs.findIndex((db: any) => db.defaultDB) === -1,
                          properties: {
                            driver_class_name: defaultDBData.driver_class_name,
                            url: defaultDBData.url,
                            password: '',
                            username: ''
                          }
                        });
                      }}>新增</Button>,
              <Button disabled={!defaultData} key="rest"
                      onClick={() => connectJDBC()}>{state.loading ? "正在连接" : "测试"}</Button>,
            ]);
          },
        }}
      >
        <ProCard direction="column" ghost gutter={[0, 16]}>
          <ProCard gutter={16} ghost>
            <ProCard colSpan={12} ghost>
              <ProFormList
                name="dbs"
                creatorButtonProps={false}
                label={
                  <span>{defaultDB ? ` 当前使用的数据源为「${defaultDB.name}」` : tempDBs.length > 0 ? ' 当前未选择默认数据源' : '当前未创建数据源'}</span>}
                itemRender={
                  ({listDom, action}, {record}) => {
                    console.log(147, 'record', record);
                    return (
                      <ProFormGroup size={8}>
                        <ProFormRadio
                          name="defaultDB"
                          fieldProps={{
                            onChange: () => {
                              projectDispatch.setDefaultDb(record.key)
                            }
                          }}/>
                        <ProFormSelect
                          options={databaseSelect || []}
                          name="select"
                          fieldProps={{
                            disabled: !record.defaultDB,
                            onChange: (value: any, option: any) => {
                              console.log(166, value, option);
                              projectDispatch.updateDbs('select', value);
                              projectDispatch.updateDbs('properties', {
                                driver_class_name: url[value?.toLowerCase()].driver_class_name,
                                url: url[value?.toLowerCase()].url,
                                username: '',
                                password: ''
                              });
                            }
                          }}
                        />
                        <ProFormText
                          name="name"
                          fieldProps={{
                            disabled: !record.defaultDB,
                            onBlur: (e) => {
                              console.log(182, e.target.value);
                              projectDispatch.updateDbs('name', e.target.value);
                            }
                          }}
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        />
                        <Popconfirm
                          title={record.defaultDB ? "是否要删除默认数据源？删除之后，系统将不存在默认数据源！" : "是否删除该数据源？"}
                          onConfirm={() => projectDispatch.removeDbs(record.key)}
                          okText="是"
                          cancelText="否"
                        >
                          <a><DeleteOutlined title={"删除"}/></a>
                        </Popconfirm>
                      </ProFormGroup>
                    );
                  }
                }
                copyIconProps={false}
              />

            </ProCard>
            <ProCard colSpan={12} ghost>
              <ProFormText
                width="lg"
                name="driver_class_name"
                label="driver_class_name"
                placeholder="driver_class_name"
                fieldProps={{
                  onBlur: (e) => {
                    console.log(225, e.target.value);
                    projectDispatch.updateDbs('properties', {
                      ...defaultDbs.properties,
                      driver_class_name: e.target.value
                    });
                  }
                }}
                formItemProps={{
                  rules: [
                    {
                      required: true,
                      message: '不能为空',
                    },
                    {
                      max: 300,
                      message: '不能大于 300 个字符',
                    },
                  ],

                }}
              />
              <ProFormText
                width="lg"
                name="url"
                label="url"
                placeholder="请输入url"
                fieldProps={{
                  onBlur: (e) => {
                    console.log(254, e.target.value);
                    projectDispatch.updateDbs('properties', {
                      ...defaultDbs?.properties,
                      url: e.target.value
                    });
                  }
                }}
                formItemProps={{
                  rules: [
                    {
                      required: true,
                      message: '不能为空',
                    },
                    {
                      max: 300,
                      message: '不能大于 300 个字符',
                    },
                  ],
                }}
              />
              <ProFormText
                width="lg"
                name="username"
                label="username"
                placeholder="请输入username"
                fieldProps={{
                  onBlur: (e) => {
                    console.log(281, e.target.value);
                    projectDispatch.updateDbs('properties', {
                      ...defaultDbs?.properties,
                      username: e.target.value
                    });
                  }
                }}
                formItemProps={{
                  rules: [
                    {
                      required: true,
                      message: '不能为空',
                    },
                    {
                      max: 100,
                      message: '不能大于 100 个字符',
                    },
                  ],
                }}
              />
              <ProFormText.Password
                width="lg"
                name="password"
                label="password"
                placeholder="请输入password"
                fieldProps={{
                  onBlur: (e) => {
                    console.log(308, e.target.value);
                    projectDispatch.updateDbs('properties', {
                      ...defaultDbs?.properties,
                      password: e.target.value
                    });
                  }
                }}
                formItemProps={{
                  rules: [
                    {
                      required: true,
                      message: '不能为空',
                    },
                    {
                      max: 100,
                      message: '不能大于 100 个字符',
                    },
                  ],
                }}
              />
            </ProCard>
          </ProCard>
        </ProCard>
      </ProForm>
      <Divider dashed />
      <ProCard direction="column"  gutter={[0, 16]} bordered>
        <ProDescriptions
          title="免费在线MYSQL数据源"
          tooltip={"下面提供的数据源仅供体验功能，请不要将私密元数据往里面同步，注意保护自己的元数据隐私！"}
          column={1}
          dataSource={{
            driver_class_name: 'com.mysql.jdbc.Driver',
            url: 'jdbc:mysql://mysql.sqlpub.com:3306/erdonline?characterEncoding=UTF-8&useSSL=false&useUnicode=true&serverTimezone=UTC',
            username: 'erdonline',
            password: '274623019c590e8f',
          }}
          columns={[
            {
              title: 'driver_class_name',
              key: 'driver_class_name',
              dataIndex: 'driver_class_name',
              ellipsis: true,
              copyable: true,
            },
            {
              title: 'url',
              key: 'url',
              dataIndex: 'url',
              ellipsis: true,
              copyable: true,
            },
            {
              title: 'username',
              key: 'username',
              dataIndex: 'username',
              ellipsis: true,
              copyable: true,
            },
            {
              title: 'password',
              key: 'password',
              dataIndex: 'password',
              ellipsis: true,
              copyable: true,
            },
            {
              title: '操作',
              valueType: 'option',
              render: () => [
                <a target="_blank" href="https://www.sqlpub.com/" key="link">
                  申请免费数据源
                </a>,
              ],
            },
          ]}
        >
        </ProDescriptions>
      </ProCard>
    </>
  );
};

export default React.memo(DatabaseSetUp)
