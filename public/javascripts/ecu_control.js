/**
 * This javascript file is used for integrated functions of HTML VCI_Interface
 * Author: Zheng Haitao
 * Date: 2020.10.12
 */

/**
 * 1st section: Function definition
 */

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

// 零件号比对
function part_compare(soll, ist){
    return soll === ist;
}

// ECU安装检测请求
function part_check(ecu, selected_plug){
    let ecu_selector = "#"+ecu;
    $(""+ecu_selector+" .part-info-btn").on('click', '.btn', function () {
        // 再次点击请求前先把之前的元素去掉
        $(""+ecu_selector+" .num-soll").hide('fast');
        $(""+ecu_selector+" .num-ist").hide('fast');
        $(""+ecu_selector+" .part-info-item .part-res-status").hide('fast');
        $.ajax({
            url: '/request',
            type: 'GET',
            async: true,
            dataType: 'json',
            data: {function: 10, key: selected_plug, carType: "VW416", ecuName: ecu},
            success: function (data) {
                let res_flag = data.result;
                if (!res_flag)
                {
                    // 周期性查询该安装检测结果，使用请求代码110
                    part_check_query(ecu, selected_plug, ecu_selector)

                }
                else
                {
                    alert('诊断插头已经断开')
                }
            }
        })
    });
}

// 安装检测周期性查询函数
function part_check_query(ecu, selected_plug, ecu_selector){
    $.ajax({
        url: '/request',
        type: 'GET',
        async: true,
        dataType: 'json',
        data: {function: 110, key: selected_plug, ecuName: ecu},
        success: function (data) {
            let part_info = data.installationStatus;
            let zdc_status = data.installationStatus.zdc;
            let ecu_part_finished = install_finished(part_info);

            // 当判断到该控制器安装检测已经结束的条件
            if (ecu_part_finished){
                // 将服务器获得的soll值赋给div
                let soll_selector = $(""+ecu_selector+" .part-info-wrap").find('.num-soll');
                soll_selector.eq(0).text(part_info.tnr.soll);
                soll_selector.eq(1).text(part_info.swv.soll);
                soll_selector.eq(2).text(part_info.hwv.soll);

                // 将服务器获得的ist值赋给div
                let ist_selector = $(""+ecu_selector+" .part-info-wrap").find('.num-ist');
                ist_selector.eq(0).text(part_info.tnr.ist);
                ist_selector.eq(1).text(part_info.swv.ist);
                ist_selector.eq(2).text(part_info.hwv.ist);

                // 判断比对结果
                let tnr_res = part_compare(part_info.tnr.soll, part_info.tnr.ist);
                let swv_res = part_compare(part_info.swv.soll, part_info.swv.ist);
                let hwv_res = part_compare(part_info.hwv.soll, part_info.hwv.ist);
                let res = [tnr_res, swv_res, hwv_res];

                $(""+ecu_selector+" .num-soll").show('fast');
                // 加载零件号信息，并以红绿灯形式展示比对结果
                for (let i=0; i<res.length; i++)
                {
                    $(""+ecu_selector+" .num-ist").eq(i).show('slow', function () {
                        if (res[i]){
                            $(""+ecu_selector+" .part-info-item .part-res-status").eq(i).html('<img src="../images/part_status_green.svg" alt="" style="width: 100%">');
                        }
                        else
                        {
                            $(""+ecu_selector+" .part-info-item .part-res-status").eq(i).html('<img src="../images/part_status_red.svg" alt="" style="width: 100%">');
                        }
                    });
                    $(""+ecu_selector+" .part-info-item .part-res-status").eq(i).show('slow');
                }
            }
            else
            {
                setTimeout(function () {
                    part_check_query(ecu, selected_plug, ecu_selector);
                }, 1000)
            }
        }
    })
}

// ZDC写入请求，通过对ZDC按钮的监控实现
function zdc_write(ecu, selected_plug){
    let ecu_selector = "#"+ecu;
    // 使用ajax发送写ZDC请求
    $(""+ecu_selector+" .zdc").on('click', '.btn', function () {
        // 点击之后暂时把按钮禁用或者隐藏起来
        $(this).hide('slow');

        // 再次点击先将结果展示div隐藏起来
        $(""+ecu_selector+" .zdc .zdc-result").html('');


        // 将ZDC未写图片转化成加载图标
        $(""+ecu_selector+" .zdc img").hide('slow', function () {
            $(""+ecu_selector+" .zdc .loader").show('slow');
        });

        $.ajax({
            url: '/request',
            type: 'GET',
            async: true,
            dataType: 'json',
            data: {function: 3, key: selected_plug, carType: "VW416", ecuName: ecu},
            success: function (data) {
                let res_flag = data.result;
                if (!res_flag)
                {
                    // 周期性查询该安装检测结果，使用请求代码103
                    zdc_query(ecu, selected_plug, ecu_selector)

                }
                else
                {
                    alert('诊断插头已经断开')
                }
            }
        })
    })
}

// ZDC写入周期性查询函数
function zdc_query(ecu, selected_plug, ecu_selector){
    $.ajax({
        url: '/request',
        type: 'GET',
        async: true,
        dataType: 'json',
        data: {function: 103, key: selected_plug, ecuName: ecu},
        success: function (data) {
            let zdc_res = data.result;
            let zdc_finished = (zdc_res===-2)||(zdc_res===1)||(zdc_res===2);
            // 当判断到该控制器ZDC写入已经结束的条件
            if (zdc_finished){
                // 当判断ZDC正确写入时，让loader消失，出现动态加载框，并显示结果。
                setTimeout(function () {
                    $(""+ecu_selector+" .zdc .loader").hide('fast', function () {
                        let selector = $(""+ecu_selector+" .zdc .progress-wrap")[0];
                        progress_ani(ecu_selector, selector, zdc_res);
                    });
                }, 1000);

            }
            else
            {
                setTimeout(function () {
                    zdc_query(ecu, selected_plug, ecu_selector);
                }, 1000)
            }
        }
    })
}

// ZDC动态加载调函数
function progress_ani(ecu_selector, selector, zdc_res){
    let bar = new ProgressBar.Line(selector, {
        strokeWidth: 1,
        easing: 'easeInOut',
        duration: 500,
        color: 'salmon',
        // trailColor: 'blue',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '4px'},
        from: {color: '#448900'},
        to: {color: '#7fff00'},
        step: (state, bar) => {
            bar.path.setAttribute('stroke', state.color);
        }
    });
    bar.animate(1, function () {
        $(""+ecu_selector+" .zdc .progress-wrap svg").hide('fast', function () {
            switch (zdc_res) {
                case -2:
                    $(""+ecu_selector+" .zdc .zdc-result").html('Not required');
                    $(""+ecu_selector+" .zdc .zdc-result").show();
                    $(""+ecu_selector+" .zdc .btn").show('fast');
                    break;

                case 1:
                    $(""+ecu_selector+" .zdc .zdc-result").html('<img src="../images/correct.svg" alt="" style="width: 100%; height: 100%">');
                    $(""+ecu_selector+" .zdc .zdc-result").show();
                    $(""+ecu_selector+" .zdc .btn").show('fast');
                    break;

                case 2:
                    $(""+ecu_selector+" .zdc .zdc-result").html('<img src="../images/error.svg" alt="" style="width: 100%; height: 100%">');
                    $(""+ecu_selector+" .zdc .zdc-result").show();
                    $(""+ecu_selector+" .zdc .btn").show('fast');
                    break;
            }

        })
    });
}

// Flash请求，通过对Flash的按钮监控实现
function flash(ecu, selected_plug){
    // 设置ECU选择器
    let ecu_selector = "#"+ecu;

    // 使用ajax发送写flash请求
    $(""+ecu_selector+" .flash").on('click', '.btn', function () {
        let progress_div = ""+ecu_selector+" .flash .progress-wrap";
        NProgress.configure({
                                        parent: progress_div,
                                        showSpinner: true,
                                        trickle: false,
                                        minimum: 0.01
                                    });

        // 点击之后暂时把按钮禁用或者隐藏起来
        $(this).hide('slow');

        // 再次点击先将结果展示div隐藏起来
        $(""+ecu_selector+" .flash .zdc-result").html('');


        // 将ZDC未写图片转化成加载图标
        $(""+ecu_selector+" .flash img").hide('slow', function () {

        });
        // 启动动态进度加载条
        NProgress.start();
        
        // ajax请求查询数据
        $.ajax({
            url: '/request',
            type: 'GET',
            async: true,
            dataType: 'json',
            data: {function: 11, key: selected_plug, carType: "VW416", ecuName: ecu},
            success: function (data) {
                let res_flag = data.result;
                if (!res_flag)
                {
                    // 周期性查询该安装检测结果，使用请求代码111
                    flash_query(ecu, selected_plug, ecu_selector)

                }
                else
                {
                    alert('诊断插头已经断开')
                }
            }
        })
    })
}

// Flash周期性查询函数
function flash_query(ecu, selected_plug, ecu_selector){
    $.ajax({
        url: '/request',
        type: 'GET',
        async: true,
        dataType: 'json',
        data: {function: 111, key: selected_plug, ecuName: ecu},
        success: function (data) {
            let flash_res = data.result;
            let flash_finished = (flash_res===-2)||(flash_res===1)||(flash_res===2);
            // 当判断到该控制器Flash已经结束的条件
            if (flash_finished){
                // 当判断Flash正确完成时, 让该按钮迅速重新出现
                $(""+ecu_selector+" .flash .btn").show('fast');

                // 让进度条加载完毕
                NProgress.done();

                // 按照flash结果展示在页面
                setTimeout(function () {
                    switch (flash_res) {
                        case -2:
                            $(""+ecu_selector+" .flash .zdc-result").html('Not required');
                            $(""+ecu_selector+" .flash .zdc-result").show();
                            break;

                        case 1:
                            $(""+ecu_selector+" .flash .zdc-result").html('<img src="../images/correct.svg" alt="" style="width: 100%; height: 100%">');
                            $(""+ecu_selector+" .flash .zdc-result").show();
                            break;

                        case 2:
                            $(""+ecu_selector+" .flash .zdc-result").html('<img src="../images/error.svg" alt="" style="width: 100%; height: 100%">');
                            $(""+ecu_selector+" .flash .zdc-result").show();
                            break;
                    }
                }, 600);

            }
            else
            {
                // 否则1s后再次询问，并随机增加进度条显示
                setTimeout(function () {
                    flash_query(ecu, selected_plug, ecu_selector);
                    if (ecu === "MOT"){
                        NProgress.inc(0.0033);
                    }
                    else  if ((ecu === "GET"))
                    {
                        NProgress.inc(0.0083);
                    }
                    else
                    {
                        NProgress.inc(0.05);
                    }

                    console.log(NProgress.status)
                }, 1000)
            }
        }
    })
}

// Flash动态加载函数
function progress_ani_flash(ecu_selector, selector, flash_res){
    let bar = new ProgressBar.Line(selector, {
        strokeWidth: 1,
        easing: 'easeInOut',
        duration: 500,
        color: 'salmon',
        // trailColor: 'blue',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '4px'},
        from: {color: '#448900'},
        to: {color: '#7fff00'},
        step: (state, bar) => {
            bar.path.setAttribute('stroke', state.color);
        }
    });
    bar.animate(1, function () {
        $(""+ecu_selector+" .flash .progress-wrap svg").hide('fast', function () {
            switch (flash_res) {
                case -2:
                    $(""+ecu_selector+" .flash .zdc-result").html('Not required');
                    $(""+ecu_selector+" .flash .zdc-result").show();
                    $(""+ecu_selector+" .flash .btn").show('fast');
                    break;

                case 1:
                    $(""+ecu_selector+" .flash .zdc-result").html('<img src="../images/correct.svg" alt="" style="width: 100%; height: 100%">');
                    $(""+ecu_selector+" .flash .zdc-result").show();
                    $(""+ecu_selector+" .flash .btn").show('fast');
                    break;

                case 2:
                    $(""+ecu_selector+" .flash .zdc-result").html('<img src="../images/error.svg" alt="" style="width: 100%; height: 100%">');
                    $(""+ecu_selector+" .flash .zdc-result").show();
                    $(""+ecu_selector+" .flash .btn").show('fast');
                    break;
            }

        })
    });
}

// 将Ecu List数组中指定控制器元素提到首位
function ecu_to_first(ecu_list_all, selected_ecu){
    let var_ecu;
    let var_index;
    for (let i=0; i<ecu_list_all.length; i++){
        if (ecu_list_all[i].ecuName === selected_ecu){
            var_ecu = ecu_list_all[i];
            var_index = i;
        }
    }
    ecu_list_all.splice(var_index, 1);
    ecu_list_all.unshift(var_ecu);
}


/**
 * 2nd section: When page is ready, call related functions
 */

// 当浏览器大小改变时触发背景图片宽度填满container的margin
window.onresize = function(){
    let margin_bg_left = parseFloat($("#ecu-block-panel .container").css('marginLeft'));
    let margin_bg_right = parseFloat($("#ecu-block-panel .container").css('marginLeft'));
    $("#left-bg").width(margin_bg_left-20);
    $("#right-bg").width(margin_bg_right-20);
};

$(document).ready(function () {
    // 获取背景左右图片的margin，并进行动态设置
       let margin_bg_left = parseFloat($("#ecu-block-panel .container").css('marginLeft'));
       let margin_bg_right = parseFloat($("#ecu-block-panel .container").css('marginLeft'));
       $("#left-bg").width(margin_bg_left-20);
       $("#right-bg").width(margin_bg_right-20);

    // 读取保存在Cookie的当前选择诊断插头
    let selected_plug = Cookies.get('click_plug');
    let selected_ecu = Cookies.get('click_ecu');
    let ecu_list_all = JSON.parse(Cookies.get('ecuList'));

    // 对在上个页面已经选择的控制器，将其在ecu list中提到首位
    ecu_to_first(ecu_list_all, selected_ecu);

    // 循环插入所有控制器的block, 并调用按钮监控函数，分别监控安装检测、ZDC写入、和Flash刷新
    for (let i=0; i<ecu_list_all.length; i++){
        let ecu = ecu_list_all[i].ecuName;
        $("#ecu-block-container").append("<div id="+ecu+" class=\"col-lg-12 ecu-block-wrap\">\n" +
            "                <h5>"+ecu+"</h5>\n" +
            "                <div class=\"row action-panel\">\n" +
            "                    <div class=\"col-lg-6 col-md-12 col-sm-12 assemble-wrap\">\n" +
            "                        <h6>Assemble</h6>\n" +
            "                        <div class=\"part-info-wrap row\">\n" +
            "                            <div class=\"col-3 part-info-item d-flex\">\n" +
            "                                <div class=\"part-res-status\">\n" +
            "                                </div>\n" +
            "                                <h6 style=\"\">TNR</h6>\n" +
            "                                <div class=\"par-info tnr\">\n" +
            "                                    <div class=\"soll-warp d-flex\">\n" +
            "                                        <div>\n" +
            "                                            Soll:\n" +
            "                                        </div>\n" +
            "                                        <div class=\"num-soll\">\n" +
            "                                        </div>\n" +
            "                                    </div>\n" +
            "                                    <div class=\"soll-warp d-flex\">\n" +
            "                                        <div>\n" +
            "                                            Ist:\n" +
            "                                        </div>\n" +
            "                                        <div class=\"num-ist\">\n" +
            "\n" +
            "                                        </div>\n" +
            "                                    </div>\n" +
            "                                </div>\n" +
            "                            </div>\n" +
            "                            <div class=\"col-3 part-info-item d-flex\">\n" +
            "                                <div class=\"part-res-status\">\n" +
            "                                </div>\n" +
            "                                <h6 style=\"padding-bottom: 1rem\">SWV</h6>\n" +
            "                                <div class=\"par-info swv\">\n" +
            "                                    <div class=\"soll-warp d-flex\">\n" +
            "                                        <div>\n" +
            "                                            Soll:\n" +
            "                                        </div>\n" +
            "                                        <div class=\"num-soll\">\n" +
            "\n" +
            "                                        </div>\n" +
            "                                    </div>\n" +
            "                                    <div class=\"soll-warp d-flex\">\n" +
            "                                        <div>\n" +
            "                                            Ist:\n" +
            "                                        </div>\n" +
            "                                        <div class=\"num-ist\">\n" +
            "\n" +
            "                                        </div>\n" +
            "                                    </div>\n" +
            "                                </div>\n" +
            "                            </div>\n" +
            "                            <div class=\"col-3 part-info-item d-flex\">\n" +
            "                                <div class=\"part-res-status\">\n" +
            "                                </div>\n" +
            "                                <h6 style=\"padding-bottom: 1rem\">HWV</h6>\n" +
            "                                <div class=\"par-info hwv\">\n" +
            "                                    <div class=\"soll-warp d-flex\">\n" +
            "                                        <div>\n" +
            "                                            Soll:\n" +
            "                                        </div>\n" +
            "                                        <div class=\"num-soll\">\n" +
            "\n" +
            "                                        </div>\n" +
            "                                    </div>\n" +
            "                                    <div class=\"soll-warp d-flex\">\n" +
            "                                        <div>\n" +
            "                                            Ist:\n" +
            "                                        </div>\n" +
            "                                        <div class=\"num-ist\">\n" +
            "\n" +
            "                                        </div>\n" +
            "                                    </div>\n" +
            "                                </div>\n" +
            "                            </div>\n" +
            "                            <div class=\"col-2 part-info-item part-info-btn d-flex\">\n" +
            "                                <div class=\"btn btn-info\" style=\"width: 100%\">\n" +
            "                                    Start\n" +
            "                                </div>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                    <div class=\"col-lg-3 col-md-6 col-sm-6 zdc-wrap\">\n" +
            "                        <h6>ZDC</h6>\n" +
            "                        <div class=\"zdc-info-wrap row zdc\">\n" +
            "                            <div class=\"zdc-item-wrap d-flex\" style=\"position: relative\">\n" +
            "                                <div class=\"loader-wrap loader\" data-loader='circle'></div>\n" +
            "                                <div class=\"loader-wrap progress-wrap d-flex\"></div>\n" +
            "                                <div class=\"loader-wrap zdc-result d-flex\"></div>\n" +
            "                                <img src=\"../images/not_start.svg\" alt=\"\" style=\"height: 100%\">\n" +
            "                            </div>\n" +
            "                            <div class=\"zdc-item-wrap d-flex\">\n" +
            "                                <div class=\"btn btn-info\" style=\"width: 80%\">Start</div>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                    <div class=\"col-lg-3 col-md-6 col-sm-6 zdc-wrap\">\n" +
            "                        <h6>Flash</h6>\n" +
            "                        <div class=\"zdc-info-wrap row flash\">\n" +
            "                            <div class=\"zdc-item-wrap d-flex\" style=\"position: relative\">\n" +
            "                                <div class=\"loader-wrap progress-wrap d-flex\"></div>\n" +
            "                                <div class=\"loader-wrap zdc-result d-flex\"></div>\n" +
            "                                <img src=\"../images/not_start.svg\" alt=\"\" style=\"height: 100%\">\n" +
            "                            </div>\n" +
            "                            <div class=\"zdc-item-wrap d-flex\">\n" +
            "                                <div class=\"btn btn-info\" style=\"width: 80%\">Start</div>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "\n" +
            "                </div>\n" +
            "            </div>");

        // 对每个控制器的安装检测按钮进行监控，当按下时执行安装检测函数
        part_check(ecu, selected_plug);
        // 对每个控制器的ZDC写入按钮进行监控，当按下时执行ZDC写入函数
        zdc_write(ecu, selected_plug);
        // 对每个控制的Flash按钮进行监控，当按下执行Flash函数
        flash(ecu, selected_plug);

    }

    // 取消footer固定格式
    $("#footer").removeClass('fixed-bottom');

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
                $("#vin-number-ecu").text(data.vin);
            }
            else
            {
                alert('插头连接出现异常')
            }
        }
    });

});