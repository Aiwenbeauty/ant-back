import React from 'react';
import { Table, Tag } from 'antd';
import { connect } from 'dva';

const statusName = props => {
  let value = '';
  switch (props) {
    case 1:
      value = <Tag color="red">未认证</Tag>;
      break;
    case 2:
      value = <Tag color="volcano">审核中</Tag>;
      break;
    case 3:
      value = <Tag color="#87d068">审核成功</Tag>;
      break;
    case 4:
      value = <Tag color="red">审核失败</Tag>;
      break;
    default:
      value = <Tag color="red">未认证</Tag>;
  }
  return value;
};

@connect(({ operate, member }) => ({
  operate,
  member,
}))
class OperateTable extends React.Component {
  state = {
    //  RecordList:this.props.RecordList
  };

  //会员资质提交通道审核
  toExamine(values) {
    const { dispatch } = this.props;
    dispatch({
      type: 'member/toExamineAuth',
      payload: [values],
    }).then(res => {
      if (res.code == 'SUCCESS') {
        // this.setState({
        //   RecordList:res.data
        // })
        dispatch({
          type: 'operate/fetch',
          payload: {
            modularType: '3',
            dataId: values.id,
          },
        });
      }

      console.log(res);
    });
  }

  render() {
    const { moduleName, operateType, operate, showExamine, member } = this.props;
    const { RecordList } = this.props;
    const pagination = {
      pageSize: 5,
    };
    const columns =
      operateType == 'memberChannel'
        ? [
            {
              title: '通道名称',
              dataIndex: 'channelName',
              key: 'channelName',
            },
            {
              title: '会员通道报备状态',
              dataIndex: 'examineStatus',
              key: 'examineStatus',
              render: value => {
                return statusName(value);
              },
            },
            {
              title: '原因',
              dataIndex: 'reason',
              key: 'reason',
            },
            {
              title: '操作',
              render: (text, record) => (
                <div style={{ whiteSpace: 'nowrap' }}>
                  {showExamine == 'examine' && record.examineStatus != '3' ? (
                    <a onClick={() => this.toExamine(record)}>报备</a>
                  ) : (
                    ''
                  )}
                </div>
              ),
            },
          ]
        : [
            {
              title: '模块名称',
              dataIndex: 'modularType',
              key: 'modularType',
              render: item => {
                return moduleName[item];
              },
            },
            {
              title: '操作类型',
              dataIndex: 'operateType',
              key: 'operateType',
              render: item => {
                return operateType[item];
              },
            },
            {
              title: '操作人',
              dataIndex: 'userName',
              key: 'userName',
            },
            {
              title: '操作时间',
              dataIndex: 'operateTime',
              key: 'operateTime',
            },
          ];
    return (
      <Table
        dataSource={RecordList}
        rowKey="index"
        className="textCenter"
        rowClassName="textCenter"
        columns={columns}
        loading={member.channelLoading}
        pagination={pagination}
        bordered={false}
        scroll={{ x: 'max-content' }}
        // onChange={this.handlePageChange}
        size="small"
      />
    );
  }
}

export default OperateTable;
