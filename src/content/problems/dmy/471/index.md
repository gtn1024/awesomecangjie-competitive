---
oj: dmy
pid: '471'
title: '[R76C] 这回不是站点了'
difficulty: 普及−
tags:
  - 数学
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le h \le 200$，$2 \le w \le 20$。

## 思路

记第 $k$ 列（从 $0$ 开始编号）的位权为 $W_k = 2^{w-1-k}$，第 $r$ 行第 $k$ 列的字符为 $b_{r,k} \in \{0,1\}$，第 $k$ 列中 `1` 的个数为 $c_k = \sum_r b_{r,k}$。原得分为

$$\text{base} = \sum_{k} c_k W_k .$$

**交换带来的增量。** 选定 $i < j$ 交换后，对第 $r$ 行来说，只有第 $i$、$j$ 两位换了值：第 $i$ 位由 $b_{r,i}$ 变成 $b_{r,j}$，第 $j$ 位由 $b_{r,j}$ 变成 $b_{r,i}$。于是这一行的得分变化是

$$(b_{r,j} - b_{r,i})W_j + (b_{r,i} - b_{r,j})W_i = (b_{r,i} - b_{r,j})(W_i - W_j).$$

对所有行求和：

$$\Delta(i,j) = (W_i - W_j)\sum_{r=1}^{h}(b_{r,i} - b_{r,j}) = (W_i - W_j)(c_i - c_j).$$

这里用到了 $\sum_r b_{r,k} = c_k$。**关键结论：增量只取决于两列各自 `1` 的个数 $c_i, c_j$ 和位权差，与两列是否在同一些行上同时为 `1` 完全无关。**

**答案。** 必须交换且不能不操作，所以枚举所有 $i<j$ 取最大的增量即可：

$$\text{ans} = \text{base} + \max_{1 \le i < j \le w} (W_i - W_j)(c_i - c_j).$$

注意增量可以为负（样例 2 就是 $2 - 1 = 1$），取最大值自然覆盖这种情况；由于 $w \ge 2$ 至少存在一对列，不会没有候选。

## 复杂度

时间 $O(hw + w^2)$，空间 $O(w)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let hw = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let h = hw[0]
    let w = hw[1]
    let cnt = Array<Int64>(w, { _ => 0 })
    var r: Int64 = 0
    while (r < h) {
        let s = reader.readln().getOrThrow()
        var j: Int64 = 0
        while (j < w) {
            if (Int64(s[j]) == 49) {
                cnt[j] += 1
            }
            j += 1
        }
        r += 1
    }
    let pw = Array<Int64>(w, { _ => 0 })
    var k: Int64 = 0
    while (k < w) {
        pw[k] = 1 << (w - 1 - k)
        k += 1
    }
    var base: Int64 = 0
    k = 0
    while (k < w) {
        base += cnt[k] * pw[k]
        k += 1
    }
    var best: Int64 = -(1 << 62)
    var i: Int64 = 0
    while (i < w) {
        var j: Int64 = i + 1
        while (j < w) {
            let delta = (pw[i] - pw[j]) * (cnt[j] - cnt[i])
            if (delta > best) {
                best = delta
            }
            j += 1
        }
        i += 1
    }
    println(base + best)
}
```

</details>
