---
oj: dmy
pid: '463'
title: '[R75A] 灯'
difficulty: 入门
tags:
  - 模拟
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le P_1, P_2, P_3 \le 3$。

## 思路

每盏灯只有被按下奇数次才是亮着的，初始关闭不影响这个判断。三次按下至多影响三盏灯，因此只需统计编号 $1, 2, 3$ 各自被按下的次数，次数为奇数的灯计入答案。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let p = getStdIn().readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
    let cnt = Array<Int64>(3, { _ => 0 })
    for (x in p) {
        cnt[x - 1] += 1
    }
    var ans: Int64 = 0
    for (i in 0..3) {
        if (cnt[i] % 2 == 1) {
            ans += 1
        }
    }
    println(ans)
}
```

</details>
