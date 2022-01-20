/*
 * @Descripttion: 通用添加方法mixins
 * @version: 1.0.0
 * @Author: LSC
 * @Date: 2021-09-04 11:29:39
 * @LastEditors: LSC
 * @LastEditTime: 2021-09-06 13:37:57
 */
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
    })
}
function changeFileToBaseURL(file, fn) {
    // 创建读取文件对象
    var fileReader = new FileReader();
    //如果file没定义返回null
    if (file == undefined) return fn(null);
    // 读取file文件,得到的结果为base64位
    fileReader.readAsDataURL(file);
    fileReader.onload = function () {
        // 把读取到的base64
        var imgBase64Data = this.result;
        fn(imgBase64Data);
    }
}

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}
export default {
    data() {
        return {
            form: {
                file: '', // 人脸照片
                faceNo: '', // 人员编号
                personName: '', // 姓名
                personSex: undefined, // 0-女;1-男
                startValidTime: '', // 开始
                endValidTime: '', // 结束
                contactPhone: '', // 手机号
                age: '', // 年龄
                personCard: '', // 身份证
                birthDate: '', // 出生日期
                country: '', // 国家
                nativePlace: '', // 籍贯
                nation: '', // 民族
                occupation: '', // 职业
                email: '', // 电子邮箱
                address: '', // 居住地
                remarks: '', // 备注
                faceGroupId: '', // 关联分组id
                personLabelIdList: [], //人员标签
                visitorPersonName: '' // 拜访人员
            }
        }
    },
    watch: {
        personTags() {
            if (this.personTags && this.personTags.length > 5) {
                this.$message.warning('最多只能添加五个标签,若要添加其他标签请删除之前的标签')
                this.personTags.splice(5, 1)
            }
            if (this.personTags && this.personTags.length > 0) {
                this.form.personLabelIdList = true
            } else {
                this.form.personLabelIdList = ''
            }
        }
    },
    methods: {
        // 图片上传方法
        // 上传前验证大小
        beforeUpload(file) {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
            if (!isJpgOrPng) {
                this.$message.error('You can only upload JPG file!')
            }
            const isLt2M = file.size / 1024 / 1024 < 1
            if (!isLt2M) {
                let obj = {
                    file: file,
                    targetSize: "",
                    width: 1080,
                    fileName: "",
                    quality: "",
                    succ: (cal) => {
                        return cal
                    }
                }
                this.pressImg(obj)
            }
            return isJpgOrPng && isLt2M
        },
        pressImg(param) {
            let that = this
            //如果没有回调函数就不执行
            if (param) {
                //如果file没定义返回null
                if (param.file == undefined) return param.succ(null);
                //给参数附初始值
                param.targetSize = param.hasOwnProperty("targetSize") ? param.targetSize : -1;
                param.width = param.hasOwnProperty("width") ? param.width : -1;
                param.fileName = param.hasOwnProperty("fileName") ? param.fileName : "image";
                param.quality = param.hasOwnProperty("quality") ? param.quality : 0.92;
                var _this = this;
                // 得到文件类型
                var fileType = param.file.type;
                if (fileType.indexOf("image") == -1) {
                    return param.succ(null);
                }
                //如果当前size比目标size小，直接输出
                var size = param.file.size;
                if (param.targetSize > size) {
                    return param.succ(param.file);
                }
                // 读取file文件,得到的结果为base64位
                changeFileToBaseURL(param.file, function (base64) {
                    if (base64) {
                        var image = new Image();
                        image.src = base64;
                        image.onload = function () {
                            let w = parseInt(image.width)
                            let h = parseInt(image.height)
                            if (w < 1080) return this.$message.error('请上传小于1M的图片!')


                            //创建一个canvas
                            var canvas = document.createElement('canvas');
                            //获取上下文
                            var context = canvas.getContext('2d');
                            if (w > h) {
                                let big = (1080 / w).toFixed(2)
                                canvas.width = 1080
                                canvas.height = h * parseFloat(big)
                            } else {
                                let big = (1080 / h).toFixed(2)
                                canvas.height = 1080
                                canvas.width = w * parseFloat(big)
                            }
                            context.drawImage(image, 0, 0, canvas.width, canvas.height);
                            //压缩图片，获取到新的base64Url
                            let newImageData = canvas.toDataURL(fileType, param.quality);
                            that.imageUrl = newImageData
                            // //将base64转化成文件流
                            that.form.file = dataURLtoFile(newImageData, param.fileName);
                        }


                    }
                });

            }
        },
        handleChange(info) {
            if (info.file.status === 'uploading') {
                this.loading = true
                return
            }
            if (info.file.status === 'done') {
                getBase64(info.file.originFileObj, (imageUrl) => {
                    this.imageUrl = imageUrl
                    this.loading = false
                })
            }
        },
        // 图片自定义上传
        handleAvatarSuccess({ action, file, onSuccess, onError, onProgress }) {
            this.form.file = file
            const base64 = new Promise((resolve) => {
                const fileReader = new FileReader()
                fileReader.readAsDataURL(file)
                fileReader.onload = () => {
                    resolve(fileReader.result)
                    this.imageUrl = fileReader.result
                }
            })
        },
        // *有关于树的方法

        // *树形方法 start
        // 展开收缩
        onExpand(expandedKeys) {
            this.expandedKeys = expandedKeys
            this.autoExpandParent = false
        },
        onSelect(selectedKeys, { selectedNodes }) {
            this.form.faceGroupId = selectedKeys
            if (selectedKeys.length > 0) {
                let num = selectedKeys.join(',')
                this.selectedKeys = num
                this.selectedata = selectedKeys
                this.faceGroup = selectedNodes && selectedNodes[0].data.props.groupName
            }
            this.getthename(this.gData)
        },
        // 处理数据
        getParentKey(key, tree) {
            let parentKey
            for (let i = 0; i < tree.length; i++) {
                const node = tree[i]
                if (node.children) {
                    if (node.children.some((item) => item.key === key)) {
                        parentKey = node.key
                    } else if (this.getParentKey(key, node.children)) {
                        parentKey = this.getParentKey(key, node.children)
                    }
                }
            }
            return parentKey
        },
        // 递归搜索树
        searchList(data) {
            for (let i = 0; i < data.length; i++) {
                const node = data[i]
                const key = node.id
                this.dataList.push({ key, title: data[i].name })
                if (data[i].children) {
                    this.searchList(data[i].children)
                }
            }
        },
        // 递归获取名称
        getthename(data) {
            data.forEach((element) => {
                if (this.newSelect == element.id) {
                    return (this.name = element.name)
                }
                if (element.children) {
                    this.getthename(element.children)
                }
            })
        },
        // 递归树形
        generateList(data) {
            for (let i = 0; i < data.length; i++) {
                data[i].title = data[i].groupName
                data[i].key = data[i].id
                data[i].name = `${data[i].groupName} `
                // data[0].disableCheckbox = true
                if (data[i].children) {
                    this.generateList(data[i].children)
                }
            }
        },
        // 给所有数据添加新字段
        getscopedSlots(data) {
            data.forEach((item) => {
                item.key = item.id
                item.value = item.id
                item.title = item.groupName
                item.scopedSlots = this.scopedSlots
                if (item.children) {
                    this.getscopedSlots(item.children)
                }
            })
        },
        // 搜索
        onChange(e) {
            const value = e.target.value
            const expandedKeys = this.dataList
                .map((item) => {
                    if (item.title.indexOf(value) > -1) {
                        return this.getParentKey(item.key, this.gData)
                    }
                    return null
                })
                .filter((item, i, self) => item && self.indexOf(item) === i)
            Object.assign(this, {
                expandedKeys,
                searchValue: value,
                autoExpandParent: true
            })
        },
        // *树形方法 end
        /**
         * @description: 处理时间
         * @param {*}values
         * @return {*}
         */
        checkTime(values) {
            if (values.endValidTime) {
                values.endValidTime = this.dateToMs(values.endValidTime) // 时间搓转换
            } else {
                values.endValidTime = this.dateToMs(new Date('2099-12-31')) // 时间搓转换
            }
            if (values.birthDate) {
                values.birthDate = this.dateToMs(values.birthDate)
            }
        }
    }
}
