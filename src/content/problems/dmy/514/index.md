---
oj: dmy
pid: '514'
title: '[R80C] 删除球'
difficulty: 普及+/提高
tags:
  - 前缀和
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

## 数据规模

$1 \le n \le 2 \times 10^5$，$0 \le k \le n$，$1 \le a_i \le n$，$1 \le c_i \le 10^9$。

全部球都删除的总费用最大可达 $2 \times 10^5 \times 10^9 = 2 \times 10^{14}$，超出 32 位整数范围，需要用 64 位整数保存。

## 思路

**把保留集合看成一个颜色区间。** 设保留下来的球中最小颜色为 $L$，最大颜色为 $R$，则题目要求 $R - L \le k$，于是所有被保留的颜色都落在区间 $[L, L + k]$ 内。

反过来，把 $[x, x + k]$ 内的球全部保留，一定合法。若某个最优解保留的集合恰好在这个区间内，把区间内本该删除的球改成保留，既不破坏合法性，又因为 $c_i \ge 1$ 而只会减少费用。所以最优解一定是「保留某个颜色区间 $[x, x+k]$ 内的所有球」。

**按颜色聚合费用。** 令 $w_x$ 为颜色 $x$ 的所有球的删除费用之和，$P_x = \sum_{y=1}^{x} w_y$ 为前缀和，$C = P_n$ 为删除所有球的总费用。保留区间 $[x, x+k]$ 相当于省下

$$
P_{\min(n,\,x+k)} - P_{x-1},
$$

所以答案就是

$$
C - \max_{1 \le x \le n}\bigl(P_{\min(n,\,x+k)} - P_{x-1}\bigr).
$$

$w_x$ 用下标数组累加即可，不需要排序。

**非空区间自动满足。** 题目要求至少保留一个球，而 $c_i \ge 1$，所以只要存在球，就存在省费为正的非空区间，最大值必然在非空区间取到，不必额外判断。$k = 0$ 时区间退化为单色，公式依然成立。

## 复杂度

时间复杂度 $O(n)$：一次聚合、一次前缀和、一次枚举。空间复杂度 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let k = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = n
    let w = Array<Int64>(nn + 2, { _ => 0 })
    var total: Int64 = 0
    for (i in 0..nn) {
        w[a[i]] += c[i]
        total += c[i]
    }
    let pre = Array<Int64>(nn + 2, { _ => 0 })
    for (i in 1..=nn) {
        pre[i] = pre[i - 1] + w[i]
    }
    var best: Int64 = 0
    for (x in 1..=nn) {
        var r = x + k
        if (r > nn) {
            r = nn
        }
        let s = pre[r] - pre[x - 1]
        if (s > best) {
            best = s
        }
    }
    println(total - best)
}
```

</details>
