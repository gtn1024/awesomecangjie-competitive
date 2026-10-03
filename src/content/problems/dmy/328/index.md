---
oj: dmy
pid: '328'
title: '[R53A] 外卖'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le S \le 200$。

## 思路

每笔订单都需要支付 $5$ 元配送费，因此先令答案为 $S+5$。

若 $S\ge 100$，订单满足优惠条件，再从答案中减去 $20$ 元；否则不需要进行其他处理。

上述计算始终加上了配送费，且仅在菜品总价达到 $100$ 元时减去优惠金额，所以得到的正是最终应付金额。

复杂度：时间复杂度为 $O(1)$，空间复杂度为 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let price = Int64.parse(reader.readln().getOrThrow())

    var answer = price + 5
    if (price >= 100) {
        answer -= 20
    }

    println(answer)
}
```

</details>
