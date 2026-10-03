---
oj: dmy
pid: '131'
title: '[R22C]奇偶偶奇'
difficulty: 提高
tags:
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq T \leq 10$，$4 \leq n \leq 10^5$，$1 \leq a_i \leq 10^9$。

## 思路

要判断是否存在下标 $i < j < k < l$，满足 $a_i, a_l$ 为奇数，$a_j, a_k$ 为偶数。

把要求拆成顺序的四个阶段：先选一个奇数（对应 $i$），其后选一个偶数（对应 $j$），再其后选一个偶数（对应 $k$），最后选一个奇数（对应 $l$）。

**贪心**地看，为了让后面更可能凑齐，每个阶段都应该选最早出现的位置：最早的奇数给 $i$ 留下了最大的剩余空间，随后最早的偶数给 $j$，依此类推。若这种最宽松的选择都凑不齐四个位置，则任何选择都不可能凑齐。

于是用一次扫描维护一个状态机：

- `state=0`：等待奇数（选 $i$），遇到奇数即推进到 `state=1`；
- `state=1`：等待偶数（选 $j$），遇到偶数即推进到 `state=2`；
- `state=2`：等待偶数（选 $k$），遇到偶数即推进到 `state=3`；
- `state=3`：等待奇数（选 $l$），遇到奇数即推进到 `state=4`。

扫描结束后，若 `state==4` 则输出 `Yes`，否则 `No`。

## 复杂度

每组数据单次线性扫描，时间复杂度 $O(n)$，空间 $O(n)$（读入数组）。总时间 $O(\sum n)$，完全在限制内。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        let n = Int64.parse(reader.readln().getOrThrow())
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        var state = 0
        for (x in a) {
            let odd = (x % 2 != 0)
            match (state) {
                case 0 => if (odd) { state = 1 }
                case 1 => if (!odd) { state = 2 }
                case 2 => if (!odd) { state = 3 }
                case 3 => if (odd) { state = 4 }
                case _ => ()
            }
        }
        if (state == 4) {
            println("Yes")
        } else {
            println("No")
        }
    }
}
```

</details>
