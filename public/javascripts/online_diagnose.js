/**
 * This javascript file is used for integrated functions of HTML VCI_Interface
 * Author: Zheng Haitao
 * Date: 2020.10.12
 */

/**
 * 1st section: Function definition
 */

// 动态加载调函数
function progress_ani(selector, duration, ani, btn_status, ecu){
    let bar = new ProgressBar.Line(selector, {
        strokeWidth: 1,
        easing: ani,
        duration: duration,
        color: 'salmon',
        // trailColor: 'blue',
        trailWidth: 1,
        svgStyle: {width: '50%', height: '100%'},
        from: {color: '#448900'},
        to: {color: '#7fff00'},
        step: (state, bar) => {
            bar.path.setAttribute('stroke', state.color);
        }
    });
    bar.animate(1, function () {
        let ecu_select = "#"+ecu;
        // 让加载条消失
        // $(ecu_select).find('.progress_bar').hide('slow');
        $(ecu_select).find('.progress_bar').html('');

        // 从入参获得检测状态
        let part_check_res = btn_status[0];
        let zdc_check_res = btn_status[1];
        let flash_check_res = btn_status[2];
        // 当安装检测合格时，按钮变成绿色，否则保持灰色
        if(part_check_res){
            $(ecu_select).find('.ecuAssemble').removeClass('btn-deactivate');
            $(ecu_select).find('.ecuAssemble').addClass('btn-success');
        }
        else
        {
            $(ecu_select).find('.ecuAssemble').removeClass('btn-deactivate');
            $(ecu_select).find('.ecuAssemble').addClass('btn-danger');
        }
        // 判断zdc检测状态改变ZDC按钮
        if (zdc_check_res === 1)
        {
            $(ecu_select).find('.ecuZDC').removeClass('btn-deactivate');
            $(ecu_select).find('.ecuZDC').addClass('btn-success');
        }
        else if (zdc_check_res === 2)
        {
            $(ecu_select).find('.ecuZDC').removeClass('btn-deactivate');
            $(ecu_select).find('.ecuZDC').addClass('btn-danger');
        }
        // 判断flash检测状态并改变flash按钮
        if (flash_check_res)
        {
            $(ecu_select).find('.ecuFlash').removeClass('btn-deactivate');
            $(ecu_select).find('.ecuFlash').addClass('btn-success');
        }
        else
        {
            $(ecu_select).find('.ecuFlash').removeClass('btn-deactivate');
            $(ecu_select).find('.ecuFlash').addClass('btn-danger');
        }

    });
}

// 零件号比对函数
function install_res_compare(part_info){
    if (part_info.hwv.soll !== part_info.hwv.ist){
        return false
    }

    if (part_info.swv.soll !== part_info.swv.ist){
        return false
    }

    return part_info.tnr.soll === part_info.tnr.ist;
}

// 安装检测是否完成判断函数
function install_finished(part_info){
    if (!(part_info.swv.soll && part_info.swv.ist)){
        return false
    }

    if (!(part_info.hwv.soll && part_info.hwv.ist)){
        return false
    }

    if (!(part_info.tnr.soll && part_info.tnr.ist)){
        return false
    }

    if (part_info.zdc === -1){
        return false
    }

    return part_info.zdc !== 0;
}

// 生成区间随机数
function RandomNumBoth(Min, Max){
    let Range = Max - Min;
    let Rand = Math.random();
     //四舍五入
    return Min + Math.round(Rand * Range);
}

// 单个控制器轮询安装检测结果函数
function frequent_install_req(ecu, selected_plug){
    $.ajax({
        type: "GET",
        url: "/request",
        dataType: "json",
        async: false,
        data: {function: 110, key: selected_plug, ecuName: ecu},
        success: function (data) {
            if (!data.result){
                let part_info = data.installationStatus;
                let zdc_status = data.installationStatus.zdc;
                let flash_status;
                let ecu_part_finished = install_finished(part_info);
                // 通过软件版本是否匹配判断软件是否正确
                flash_status = part_info.swv.soll === part_info.swv.ist;

                // 当判断到该控制器安装检测已经结束的条件
                if (ecu_part_finished){
                    // 找到该控制器的div，让加载按钮消失，让进度条显示
                    let delay_random = RandomNumBoth(1000,3000);
                    // 给加载按钮设置一个1000-3000之间的随机延迟
                    setTimeout(function () {
                        let ecu_select = "#"+ecu;
                        // 对加载框进行隐藏
                        $(ecu_select).find('.ecu_loader').hide('slow');

                        // 随机加载进度条
                        let ani_random = ['linear', 'easeIn', 'easeOut', 'easeInOut'];
                        let ani_random_num = RandomNumBoth(0, ani_random.length-1);
                        let loader = $(ecu_select).find('.progress_bar')[0];
                        let duration = RandomNumBoth(1000,3000);
                        let ani = ani_random[ani_random_num];


                        // 根据检测比对结果定义按钮样式，下面数组三位分别代表安装检测结果、zdc检查结果和flash结果，flash为预留
                        let btn_status = [install_res_compare(part_info), zdc_status, flash_status];

                        // 调用进度条加载函数，加载完毕后回调函数根据btn_status设置按钮格式
                        progress_ani(loader, duration, ani, btn_status, ecu);

                    }, delay_random);
                }
                else
                {
                    // 当判断控制器安装检测未结束，递归调用查询函数
                    setTimeout(function () {
                        frequent_install_req(ecu, selected_plug);
                    }, 3000);
                }

            }
            else
            {
                alert('VCI诊断接口出现异常, 请检查VCI连接情况');
                window.location.href = 'VCI_Interface.html';
            }
        }
    });
}



/**
 * 2nd section: When page is ready, call related functions
 */
// 当文档加载准备完毕后，执行相应函数
$(document).ready(function () {

    // 读取保存在Cookie的当前选择诊断插头
    let selected_plug = Cookies.get('click_plug');
    let ecu_list_all = [];

    // 请求当前控制器列表并加载控制器
    $.ajax({
        type: "GET",
        url: "/request",
        // 此处使用同步加载，让页面呈现出图像再进行其他请求和操作
        async: false,
        data: {
            function: 13,
            key: selected_plug,
            carType: "VW416",
        },
        dataType: "json",
        success: function (data) {

            // 获取ECU 列表
            let ecuList = data.ecuList;
            Cookies.set('ecuList', ecuList);
            ecu_list_all = ecuList;
            let ecuList_block = $("#ecuList_block");
            for (let i=0; i<ecuList.length; i++)
            {
                // 动态将获取的ECU list插入ECU列表html模块
                let ecu = ecuList[i].ecuName;
                ecuList_block.append(" <div id='"+ecu+"' class=\"col-xs-6 col-sm-6 col-xl-3 col-lg-4 col-md-6\" data-aos=\"fade-up\" data-aos-delay=\"100\">\n" +
                    "                <div class=\"member\">\n" +
                    "                    <div class=\"member-info\">\n" +
                    "                        <div class=\"ecu_loader\" data-loader=\"circle\"> \n" +
                    "                        </div>\n"+
                    "                        <h4 class=\"ecuName ecu_block\">"+ecu+"</h4>\n" +
                    "                        <div>\n" +
                    "                            <div class=\"btn btn-deactivate ecuAssemble\" style=\"opacity: 0.7; font-size: 12px\">Assemble</div>\n" +
                    "                            <div class=\"btn btn-deactivate ecuZDC\" style=\"opacity: 0.7; font-size: 12px\">ZDC</div>\n" +
                    "                            <div class=\"btn btn-deactivate ecuFlash\" style=\"opacity: 0.7; font-size: 12px\">Flashen</div>\n" +
                    "                        </div>\n" +
                    "                        <div class=\"progress_bar\" style=\"height: 2px\">\n" +
                    "                        </div>\n" +
                    "                    </div>\n" +
                    "                </div>\n" +
                    "            </div>");

                // 去掉footer的fixed-bottom格式
                $("#footer").removeClass('fixed-bottom');
            }
        }
    });

    // 监听安装检测触发按钮，一旦点击发送安装检测请求
    $("#assemble-trigger").on('click', function () {

        // 无论哪次点击，点击后先将所有按钮置成灰色
        $("#ecuList_block .btn").removeClass(['btn-success', 'btn-danger']);
        $("#ecuList_block .btn").addClass('btn-deactivate');

        // 显示加载转圈图标
        $(".ecu_loader").show('slow');

        // 向服务器发送同步安装检测指令
        $.ajax({
            type: "GET",
            url: "/request",
            async: false,
            dataType: "json",
            data: {function: 2, key: selected_plug, carType: "VW416"},
            success: function (data) {
                // 服务器返回结果正确
                if (!data.result){

                }
                // 服务器返回结果异常
                else
                {
                    alert('VCI诊断接口出现异常, 请检查VCI连接情况');
                    window.location.href = 'VCI_Interface.html';
                }
            }
        });

        // 向服务器轮询单个控制器安装检测结果
        for (let i=0; i<ecu_list_all.length; i++)
        {
            let ecu = ecu_list_all[i].ecuName;
            frequent_install_req(ecu, selected_plug)
        }
    });

    // 监控每个ECU标题被点击触发的跳转事件
    $("#ecu-overview-status").on('click', 'h4', function () {
        // 将点击的ECU名字写入的Cookie里，以便于下个页面使用
        Cookies.set('click_ecu', $(this).text());
        window.location.href = "ecu_control.html";
    });

    // 监控每个ECU的Assemble、ZDC和Flash按钮被点击时触发的跳转事件
    $("#ecu-overview-status").on('click', '.btn', function () {
        let ecu_select = $(this).parent().prev().text();
        Cookies.set('click_ecu', ecu_select);
        window.location.href = "ecu_control.html";
    });

    // 获取车辆底盘号信息并填充页面
    $.ajax({
        type: 'GET',
        url: '/request',
        async: true,
        dataType: 'json',
        data: {function: 14, key: selected_plug, carType: 'VW416'},
        success: function (data) {
            if (!data.result)
            {
                // 将VIN号在指定位置显示
                $("#vin-number").text(data.vin);
            }
            else
            {
                alert('插头连接出现异常')
            }
        }
    });

});