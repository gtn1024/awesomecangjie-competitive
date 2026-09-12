---
oj: dmy
pid: '237'
title: '[R39A]三十九'
difficulty: 入门
tags:
  - 模拟
  - 数位
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 1000$。

## 思路

一个数是好的，当且仅当它的**每一个数位**都是 $3$ 的倍数，即每位只能取 $0, 3, 6, 9$（正整数不含前导 $0$，自然满足首位非零）。

$n \le 1000$ 数据规模极小，直接枚举 $1$ 到 $n$ 的每个正整数，对每个数反复取最低位 $d = x \bmod 10$，判断 $d \bmod 3 = 0$ 是否始终成立，全部成立则计入答案即可。

样例 $n = 39$：好数共有 $3, 6, 9, 30, 33, 36, 39$ 这 $7$ 个，与样例一致。

## 复杂度

- 时间：$O(n \log n)$，每位检查 $O(\log n)$ 位，$n \le 1000$ 完全可行。
- 空间：$O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

func isGood(x: Int64): Bool {
    var v = x
    while (v > 0) {
        if (v % 10 % 3 != 0) {
            return false
        }
        v /= 10
    }
    return true
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var ans = 0
    for (i in 1..=n) {
        if (isGood(i)) {
            ans++
        }
    }
    println(ans)
}
```

要点：

- 用 $d \bmod 3 = 0$ 判断单次数位，能同时覆盖 $0, 3, 6, 9$ 四种合法取值。
- 区间 `1..=n` 为左闭右闭，枚举所有不超过 $n$ 的正整数，无需单独处理边界。
