group -> 文件夹
注意点
  免费 fee_pre_ms = 0
  收费 给用户配置每月多少sui，除以到ms，再X 9个0
       可以配置终生价fee_cut_off
       上面两种open_time配置当前时间戳，close_time配置一个当前时间戳+100年的时间
  时间胶囊，相当于配置终生卡价格，或者免费，和open_time和close_time

cap -> 创建文件夹者的一个权限，里面保存对用的group_id

file —> 资源(图片，视频)
 本身有一个blob_id， 考虑在value里面存一个压缩的json{name:,midaType, 封面url，时长} fileInfo
 封面就又需要上传一个图，待定。
 
pass -> 会员(月 季 年 终身) 
  首先要判断当前group是否收费
  如果是免费
    fee传0, policy=4
    购买会员卡,四个卡型 月季年 终身对应policy(0,1,2,3)
    统一用fee_pre_ms*对应的毫秒数传入fee，如果终身直接fee_cut_off

获取数据逻辑
  打开某地址页面，首先需要获取两个数据
    1、当前地址的profle，getUserProfile
    2、当前地址下面的所有文件夹,getGroups
    3,获取默认第一个文件夹的资源fetchFilesInGroup
    4、 获取访问人地址下购买的会员是否有当前文件夹的，传入groupId getUserPass。
        有的话排列资源，没有的话，做雾化，列出4个会员卡提示用户购买
    5用户点击某个资源
      1、传入blobId，下载加密的文件
      2、 鉴权approvePtb （fileIds，groupId，passId）
      3、再传入sealClient.fetchKeys，没报错就说明通过
      4、再approvePtb，传入sealClient.decrypt解密。拿到文件

创建者打开自己页面。
getUserProfile查询没有数据，提示创建
如果有，显示修改
文件夹获取getOwnerGroups，拿到groupIds，再传入fetchFilesInGroup。拿文件夹下面的资源

上传逻辑
  
  先加密上传warlus，拿到blobId。
  再调用publishFile，这里我写了带signAndExecute，可以看哪种方便
  注意要处理fileInfo，放到string里面
  调用publishFile


      
  