---
oj: dmy
pid: '46'
title: '[R8D] Z形填数'
difficulty: 普及
tags:
  - 分治
  - 递归
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10$。

## 思路

Z 形填数就是经典的 Z 阶曲线（Morton code）。把行号 $r$ 和列号 $c$（从 $0$ 开始）的二进制位交错排开，就得到这个格子填入的数字（$0$ 基下标），加 $1$ 即为答案。具体地，第 $k$ 位上 $c$ 的位放进结果的第 $2k$ 位、$r$ 的位放进第 $2k+1$ 位。

这是因为：每次分形时，列在低位的 $0/1$ 决定左/右（红黄、蓝绿在 $x$ 轴的区分），行在低位的 $0/1$ 决定上/下；先列后行的顺序对应偶数位放 $c$、奇数位放 $r$。

$2^n \times 2^n$ 共 $2^{2n} \le 2^{20}$ 个格子，每个格子的位交错是 $O(n)$。

复杂度：时间 $O(4^n \cdot n)$，空间 $O(4^n)$（用于输出）。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var size: Int64 = 1
    for (_ in 0..n) {
        size *= 2
    }
    let S = size
    let out = StringBuilder()
    for (r in 0..S) {
        for (c in 0..S) {
            var idx: Int64 = 0
            var bit: Int64 = 0
            while (bit < n) {
                idx = idx | (((c >> bit) & 1) << (2 * bit))
                idx = idx | (((r >> bit) & 1) << (2 * bit + 1))
                bit += 1
            }
            out.append(idx + 1)
            if (c < S - 1) {
                out.append(" ")
            }
        }
        out.append("\n")
    }
    print(out.toString())
    return 0
}
```

要点：

- Z 形分形递归展开后，填入数字正是行列二进制位交错的结果，无需真的递归模拟。
