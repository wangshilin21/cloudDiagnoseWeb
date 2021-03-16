/**
 * This javascript file is used for integrated functions of HTML VCI_Interface
 * Author: Zheng Haitao
 * Date: 2020.10.12
 */

/**
 * 1st section: Function definition
 */

// AOS插件动画选项函数
function aos_init() {
    AOS.init({
        duration: 1000,
        easing: "ease-in-out-back",
        once: true
    });
}

// 初始化Isotope动画插件
function init_isotope() {
    // 初始化isotiope插件，使其和portfolio-container类进行绑定
    return $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
    })
}

// 根据返回数据加载诊断插头html片段
function dynamic_add_html(data) {
    // 对返回的插头列表进行前端处理
    let plug_container = data.keyList;
    for (let i in plug_container)
    {   // 从返回的数据中提取诊断插头编号，以及可用状态，0为可用，1为不可用
        let plug_key = plug_container[i].key;
        let plug_locked = plug_container[i].locked;
        // 确定使用图像的名字
        let img_to_locked = ["plug_activated", "plug_deactivated"];
        let img_name = img_to_locked[plug_locked];
        // 确定filter-connected还是filter-disconnected
        let connect_status = ["filter-connected", "filter-disconnected"];
        let filter_connect_status = connect_status[plug_locked];
        // 给每个诊断头添加唯一ID，方便以后调取操作
        let plug_div_id = "No."+plug_key;
        // 根据诊断插头的解锁状态对按钮的颜色和禁用进行调整
        let button_status = ["btn-info", "btn-deactivate"];
        let button_active_stats = ["", "disabled"];
        let button_style = button_status[plug_locked];
        let button_disable = button_active_stats[plug_locked];

        // 将指定html内容动态插入到VCI_Interface.html文件中
        // 开始动态插入
        $("#plug_container").append("           <div id='"+plug_div_id+"' class=\"col-lg-3 col-md-6 portfolio-item "+filter_connect_status+"\">\n" +
                                    "                <div class=\"d-flex justify-content-center align-items-center loader_div\">\n" +
                                    "                    <div data-loader=\"circle\">\n" +
                                    "                        \n" +
                                    "                    </div>\n" +
                                    "                </div>"+
                                    "                <div class=\"portfolio-wrap\">\n" +
                                    "                    <div class=\"card text-center\" style=\"\">\n" +
                                    "                        <div class=\"card-header\"><h3 style='font-weight: bold'>"+plug_div_id+"</h3></div>\n" +
                                    "                        <div class=\"card-body\">\n" +
                                    "                            <img class=\"card-img-top m-auto\" src=\"../images/"+img_name+".png\" alt=\"Card image\" style=\"width:50%; opacity: 1\">\n" +
                                    "                        </div>\n" +
                                    "                        <div class=\"card-footer\">\n" +
                                    "                            <div class=\"btn "+button_style+" "+button_disable+"\">开始诊断</div>\n" +
                                    "                        </div>\n" +
                                    "                    </div>\n" +
                                    "                </div>\n" +
                                    "            </div>");

        // 去掉footer的fixed-bottom格式
        // $("#footer").removeClass('fixed-bottom')
    }


    // 对filter按钮事件进行先进行接触绑定
    $("#portfolio-flters").off();

    // 初始化isotiope插件，使其和portfolio-container类进行绑定
    let portfolioIsotope = init_isotope();

    $('#portfolio-flters').on('click', 'li', function() {
        $("#portfolio-flters li").removeClass('filter-active');
        $(this).addClass('filter-active');

        portfolioIsotope.isotope({
            filter: $(this).data('filter')
        });
        aos_init();
    });

}

// 查询当前诊断插头状态列表并返回
function query_current_plug_list() {
    let return_values = [];
    // 获取当前轮询后最新的诊断插头状态列表
    let children_num = $("#plug_container").children().length;
    // 当当前诊断插头列表不为空时
    if (children_num)
    {
        let current_flag = [];
        for (let i=0; i<children_num; i++)
        {
            let var_class_name = $("#plug_container").children().eq(i).attr('class');
            if (var_class_name.indexOf("disconnected") !== -1)
            {
                current_flag.push(1)
            }
            else
            {
                current_flag.push(0)
            }
        }

        // 获取当前轮询后最新的对应的插头编号
        let current_plug_name =  $("#plug_container").find("h3");
        let current_name_flag = [];
        for (let i=0; i<current_plug_name.length; i++)
        {
            let var_num = current_plug_name.eq(i).text();
            var_num =  var_num.replace(/[^0-9]/ig,"");
            var_num = parseInt(var_num);
            current_name_flag.push(var_num);
        }

        // 重构当前状态的类似101函数返回Json数组
        let current_data = [];
        let current_data_key = [];
        for (let i=0; i<current_name_flag.length; i++){
            current_data[i] = {};
            current_data[i].key = current_name_flag[i];
            current_data[i].locked = current_flag[i];
        }

        return_values.push(current_name_flag);
        return_values.push(current_data);

        return return_values
    }
    else
    {
        // 当当前诊断插头查询列表为空时
        return_values = [[],[]];
        return return_values
    }

}

// 间隔查询并回调处理当前最新诊断插头状态函数
function contin_req(){

    $(".loader_div").css('opacity', '1');
    $(".loader_div").css('z-index', '100');

    // 调用查询当前诊断插头状态列表
    let current_name_flag = query_current_plug_list()[0];
    let current_data = query_current_plug_list()[1];

    // 通过ajax请求最新的诊断插头列表状态, 并于现状态对比然后更新页面
    $.ajax({
        type: "GET",
        url: "/request",
        sync: false,
        data: {function: 101},
        dataType: "json",
        success: function (data) {
            //该延迟函数的作用是让加载圈转完之后再进行页面更新
            setTimeout(function () {
                // 隐藏加载圈
                $(".loader_div").css('opacity', '0');
                $(".loader_div").css('z-index', '-100');

                // 提取从服务器获得的数据
                let update_data = data.keyList;
                let update_key_res = [];
                let update_locked_res = [];
                for (let i=0; i<update_data.length; i++){
                    update_key_res.push(update_data[i].key);
                    update_locked_res.push(update_data[i].locked);
                }
                // 首先判断两个key的数组是否相同
                let compare_key_res = array_compare(update_key_res, current_name_flag);

                // 判断当前插头数量和请求下来的是否一致，一致的话逐个对比哪个诊断插头状态发生了变化，并对其进行局部更新
                if (compare_key_res)
                {

                    for (let i=0; i<update_data.length; i++)
                    {
                        // 如果插头标号能够一一对应，但是状态不同，则对状态进行局部更新
                        if (update_data[i].locked !== current_data[i].locked)
                        {
                            // 局部更新代码写在这里
                            // 选择a元素
                            let select_a = $("#plug_container .btn")
                            // 选择首个div，修改filter-connected和filter-disconnected
                            let select_div = $("#plug_container").children();
                            // 选择img元素
                            let select_img = $("#plug_container").find('img');

                            if (update_data[i].locked === 0)
                            {
                                // 修改按钮样式及禁用状态
                                select_a.eq(i).removeClass('btn-deactivate disabled');
                                select_a.eq(i).addClass('btn-info');
                                // 修改filter分组
                                select_div.eq(i).removeClass('filter-disconnected');
                                select_div.eq(i).addClass('filter-connected');
                                // 修改所使用的图片
                                select_img.eq(i).attr('src', '../images/plug_activated.png');
                            }
                            else
                            {
                                // 修改按钮样式及禁用状态
                                select_a.eq(i).removeClass('btn-info');
                                select_a.eq(i).addClass('btn-deactivate disabled');
                                // 修改filter分组
                                select_div.eq(i).removeClass('filter-connected');
                                select_div.eq(i).addClass('filter-disconnected');
                                // 修改所使用图片
                                select_img.eq(i).attr('src', '../images/plug_deactivated.png');
                            }
                        }
                    }
                    // 更新当前filter点击状态
                    update_filter_status();
                }
                // 当前方案是，如果插头数量和请求下来的不一致，也则重新加载整个视图
                else
                {
                    // 此处占位, 没有想好怎么编写
                    window.location.reload();
                }

            }, 1000);
        }
    });
}

// 每次从新加载插头列表后，必须判断一下当前激活的是哪个filter，然后对其点击
function update_filter_status(){
    let filters = $("#portfolio-flters li");
    for (let i=0; i<filters.length; i++)
    {
        if (filters.eq(i).attr('class') === 'filter-active')
        {
            filter_act = i;
        }
    }
    filters.eq(filter_act).trigger('click');
}

// 比较两个数组内容是否完全相等
function array_compare(arr1, arr2){
    if (arr1.length !== arr2.length)
    {
        return false
    }

    for (let i=0; i<arr1.length; i++)
    {
        if (arr1[i] !== arr2[i])
        {
            return false
        }
    }

    return true
}

// 轮询获得数据处理函数
function deal_with_query_data(data){


}







/**
 * 2nd section: When page is ready, call related functions
 */
//当文档加载准备完毕后，执行相应函数
$(document).ready(function () {

    // 进入该页面后直接请求当前插头可用状态
    $.ajax({
        type: "GET",
        url: "/request",
        async: true,
        data: {function: 101},
        dataType: "json",
        success: function (data) {
            // 根据返回数据进行动态html插入
            dynamic_add_html(data);

            // 使用定时器每间隔10s向服务器请求当前最新的诊断插头列表信息
            let continue_request = setInterval(contin_req, 10000);
        }
    });

    // 监听开始诊断按钮按下事件，设置cookie
    $("#plug_container").on('click', '.btn', function () {

        // 获取点击的诊断头号码
        let selected_plug = $(this).parents().eq(1).find('h3').text();
        let key_num =  selected_plug.replace(/[^0-9]/ig,"");
        let btn_status = $(this).attr('class');

        // 判断当激活的按钮被按下时才发送ajax锁定请求
        if (btn_status.indexOf('disabled') === -1)
        {
            // 向服务器发送锁定诊断头命令
            $.ajax({
                type: "GET",
                url: "/request",
                async: true,
                data: {function: 1, key: key_num, carType: "VW416", action: 1},
                dataType: "json",
                success: function (data) {
                    let lock_res = data.result;
                    if (lock_res === 0)
                    {
                        // 将当前选择的诊断插头标号写入cookie
                        Cookies.set('click_plug', key_num);
                        // 在新标签页打开全部安装检测页面
                        window.location = 'online_diagnose.html'
                    }
                    else
                    {
                        alert('诊断插头已经断开')
                    }
                }
            });
        }
    })
});