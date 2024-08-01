import React, {useRef, useState} from "react";
import {Button, message, QRCode, Typography} from "antd";
import {
  ModalForm,
  ProCard,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
  ProFormUploadDragger,
  StepsForm
} from "@ant-design/pro-components";
import {RadioChangeEvent} from "antd/lib/radio/interface";
import {GET, POST_ERD, UPLOAD} from "@/services/crud";
import * as cache from "@/utils/cache";
import {uuid} from "@/utils/uuid";
import {logout} from "@/utils/request";
import {RcFile} from "antd/es/upload";


export type UpgradeProps = {};
const Upgrade: React.FC<UpgradeProps> = (props) => {
  const formRef = useRef<ProFormInstance>();
  // const [transInfo, setTransInfo] = useState({
  //   email: '',
  //   customer: '',
  //   productId: '',
  //   userId: '',
  //   tradeNo: '',
  //   licenseCheckModel: {},
  // });

  let transInfo = {
    email: '',
    customer: '',
    productId: '',
    userId: '',
    tradeNo: '',
    licenseCheckModel: {},
  };

  const [QRUrl, setQRUrl] = useState("");
  const [fileList, setFileList] = useState([]);


  const beforeUpload = (file: RcFile) => {
    console.log(27, file.name);
    const isLic = file.name.endsWith(".lic");
    if (!isLic) {
      message.error('只能上传 lic 文件!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('文件不能超过 2MB!');
    }
    return false;
  };


  const handleUpload = () => {
    if (fileList && fileList.length) { //检验是否有上传文件
      let formData = new FormData();
      // @ts-ignore
      formData.append('file', fileList[0]?.originFileObj);
      console.log(53, formData);
      UPLOAD("/ncnb/license/upload", formData).then(r => {
        console.log(54, r);
        if (r?.code === 200) {
          message.success('证书安装成功,重新登陆生效', 3);
          logout();
        } else {
          message.error(r?.message || '证书安装失败', 3);
        }
      });
    }
  };

  return (<>
    <ModalForm
      title="升级至尊版(解除全部限制)"
      trigger={
        <Button type="primary" key="enterprise">升级至尊版</Button>
      }

      submitter={false}
    >
      <ProCard>
        <StepsForm
          formRef={formRef}
          onFinish={async () => {
            return true
          }}
          formProps={{
            validateMessages: {
              required: '此项为必填项',
            },
          }}
        >
          <StepsForm.StepForm<{
            name: string;
          }>
            name="target"
            title="授权对象"
            stepProps={{
              description: '邮箱和公司信息',
            }}
            onFinish={async () => {
              const fieldsValue = formRef.current?.getFieldsValue();
              console.log(40, fieldsValue);
              message.warning("你的邮箱为：" + fieldsValue.email + ",授权对象为：" + fieldsValue.customer, 5);
              GET("/ncnb/license/getServerInfos", {}).then(r => {
                console.log(45, r);
                const newVar = {
                  ...transInfo,
                  email: fieldsValue.email,
                  customer: fieldsValue.customer,
                  userId: cache.getItem('username') || uuid(),
                  licenseCheckModel: r
                };
                console.log(75, newVar);
                transInfo = newVar;
              });
              return true;
            }}
          >
            <ProFormText
              name="email"
              label="邮箱"
              width="md"
              tooltip="请输入正确的邮箱，用于接收licence文件"
              placeholder="请输入邮箱"
              rules={[{required: true}]}
            />
            <ProFormText
              name="customer"
              label="授权对象"
              width="md"
              tooltip="请输入正确的授权对象，可用作水印"
              placeholder="请输入授权对象"
              rules={[{required: true}]}
            />

          </StepsForm.StepForm>

          <StepsForm.StepForm<{
            checkbox: string;
          }>
            name="uploadLicence"
            title="上传license"
            stepProps={{
              description: '请将邮箱收到的授权licence在此处上传，即可完成授权',
            }}
            onFinish={async () => {
              handleUpload();
              return true;
            }}
          >
            <ProFormUploadDragger
              name="drag-pic"
              max={1}
              description="将邮件中的附件，在此处上传完成授权"
              accept={"lic"}
              fieldProps={{
                beforeUpload: beforeUpload,
                name: 'file',
                onChange:
                  (data) => {
                    console.log(196, data)
                    //限制只上传一个文件
                    setFileList(data.fileList.slice(-1));
                    //更改文件状态
                    data.file.status = 'done';
                  }
              }}
            />
          </StepsForm.StepForm>

        </StepsForm>
      </ProCard>
    </ModalForm></>);
};

export default React.memo(Upgrade)
